import cron from "node-cron";
import { prisma } from "../../lib/prisma";
import { AttendanceStatus, EmployeeStatus, LeaveRequestStatus } from "../../../generated/prisma/client";
import { isWeekend, getStartOfDayUTC } from "./attendance.utils";
import { env } from "../../config/env";

/* ─────────────── PREVIOUS CRON JOBS (COMMENTED OUT) ─────────────── */

/*
const cronClockIn = async () => {
    const today = getStartOfDayUTC();

    if (isWeekend(today)) return;

    const holiday = await prisma.holiday.findFirst({ where: { date: today } });
    if (holiday) return;

    // 1. Fetch everything needed in 3 queries — no loop queries
    const [activeEmployees, existingRecords, activeLeaves] = await Promise.all([
        prisma.employee.findMany({
            where: { employment_status: EmployeeStatus.ACTIVE },
            select: { id: true },
        }),
        prisma.attendance.findMany({
            where: { date: today },
            select: { employee_id: true },
        }),
        prisma.leaveRequest.findMany({
            where: {
                status: LeaveRequestStatus.APPROVED,
                start_date: { lte: today },
                end_date: { gte: today },
            },
            select: { employee_id: true, id: true },
        }),
    ]);

    // 2. Build lookup sets in memory — O(1) checks, zero extra DB calls
    const alreadyHasRecord = new Set(existingRecords.map(r => r.employee_id));
    const onLeaveMap = new Map(activeLeaves.map(l => [l.employee_id, l.id]));

    // 3. Filter and separate in memory
    const employeesNeedingRecord = activeEmployees.filter(
        emp => !alreadyHasRecord.has(emp.id)
    );

    const onLeaveData = [];
    const softAbsentData = [];

    for (const emp of employeesNeedingRecord) {
        const leaveId = onLeaveMap.get(emp.id);
        if (leaveId) {
            onLeaveData.push({
                employee_id: emp.id,
                date: today,
                status: AttendanceStatus.ON_LEAVE,
                leave_request_id: leaveId,
            });
        } else {
            softAbsentData.push({
                employee_id: emp.id,
                date: today,
                status: AttendanceStatus.ABSENT,
                is_auto_clocked_out: false,
            });
        }
    }

    // 4. Two bulk inserts
    await Promise.all([
        prisma.attendance.createMany({ data: onLeaveData, skipDuplicates: true }),
        prisma.attendance.createMany({ data: softAbsentData, skipDuplicates: true }),
    ]);

    console.log(`Cron 1 done — ${onLeaveData.length} ON_LEAVE, ${softAbsentData.length} ABSENT created`);
};
*/

/*
const cronClockOut = async () => {
    const today = getStartOfDayUTC();

    if (isWeekend(today)) return;

    const holiday = await prisma.holiday.findFirst({ where: { date: today } });
    if (holiday) return;

    const [endHourRaw, endMinuteRaw] = env.SHIFT_END_TIME.trim().split(":").map(Number);
    const endHour = Number.isNaN(endHourRaw) ? 17 : endHourRaw;
    const endMinute = Number.isNaN(endMinuteRaw) ? 0 : endMinuteRaw;

    const shiftEnd = new Date(today);
    shiftEnd.setUTCHours(endHour, endMinute, 0, 0);

    // 1. Fetch both sets in parallel
    const [missingClockOut, softAbsents] = await Promise.all([
        prisma.attendance.findMany({
            where: {
                date: today,
                clock_in_time: { not: null },
                clock_out_time: null,
                is_informed: false,
            },
        }),
        prisma.attendance.findMany({
            where: {
                date: today,
                status: AttendanceStatus.ABSENT,
                is_auto_clocked_out: false,
                clock_in_time: null,
            },
            select: { id: true },
        }),
    ]);

    // 2. Bulk update soft absents
    if (softAbsents.length > 0) {
        await prisma.attendance.updateMany({
            where: { id: { in: softAbsents.map(r => r.id) } },
            data: { is_auto_clocked_out: true },
        });
    }

    // 3. Auto clock-out records that are still clocked in
    if (missingClockOut.length > 0) {
        await Promise.all(
            missingClockOut.map(record => {
                const workMinutes = record.clock_in_time
                    ? Math.floor((shiftEnd.getTime() - record.clock_in_time.getTime()) / (1000 * 60))
                    : 0;

                return prisma.attendance.update({
                    where: { id: record.id },
                    data: {
                        clock_out_time: shiftEnd,
                        status: AttendanceStatus.PRESENT,
                        is_auto_clocked_out: true,
                        work_minutes: workMinutes,
                        notes: record.notes
                            ? `${record.notes}\nAuto closed by system`
                            : "Auto closed by system",
                    },
                });
            })
        );
    }

    console.log(`Cron 2 done — ${missingClockOut.length} auto closed, ${softAbsents.length} absents finalized`);
};
*/

/* ─────────────── NEW CRON JOB ─────────────── */

/**
 * Daily Attendance Cron — Runs once per day at CRON_START_TIME.
 *
 * 1. Marks every active employee as ABSENT (if no record exists yet).
 * 2. Updates ABSENT → ON_LEAVE for employees with an approved leave today.
 * 3. Auto-clocks out employees who clocked in yesterday but never clocked out.
 *
 * Skips weekends and holidays.
 */
const cronDailyAttendance = async () => {
    const today = getStartOfDayUTC();

    if (isWeekend(today)) {
        console.log("[CRON] Daily attendance cron skipped — weekend");
        return;
    }

    const holiday = await prisma.holiday.findFirst({ where: { date: today } });
    if (holiday) {
        console.log(`[CRON] Daily attendance cron skipped — holiday: ${holiday.name}`);
        return;
    }

    // ── Part 1: Mark all active employees as ABSENT ──
    const [activeEmployees, existingRecords] = await Promise.all([
        prisma.employee.findMany({
            where: { employment_status: EmployeeStatus.ACTIVE },
            select: { id: true },
        }),
        prisma.attendance.findMany({
            where: { date: today },
            select: { employee_id: true },
        }),
    ]);

    const alreadyHasRecord = new Set(existingRecords.map(r => r.employee_id));

    const absentData = activeEmployees
        .filter(emp => !alreadyHasRecord.has(emp.id))
        .map(emp => ({
            employee_id: emp.id,
            date: today,
            status: AttendanceStatus.ABSENT,
            is_auto_clocked_out: false,
        }));

    if (absentData.length > 0) {
        await prisma.attendance.createMany({ data: absentData, skipDuplicates: true });
    }

    // ── Part 2: Update ABSENT → ON_LEAVE for employees on approved leave ──
    const [activeLeaves, absentRecords] = await Promise.all([
        prisma.leaveRequest.findMany({
            where: {
                status: LeaveRequestStatus.APPROVED,
                start_date: { lte: today },
                end_date: { gte: today },
            },
            select: { employee_id: true, id: true },
        }),
        prisma.attendance.findMany({
            where: {
                date: today,
                status: AttendanceStatus.ABSENT,
                is_auto_clocked_out: false,
                clock_in_time: null,
            },
            select: { id: true, employee_id: true },
        }),
    ]);

    const absentRecordMap = new Map(absentRecords.map(r => [r.employee_id, r.id]));

    const onLeaveUpdates: { id: string; leave_request_id: string }[] = [];

    for (const leave of activeLeaves) {
        const absentRecordId = absentRecordMap.get(leave.employee_id);
        if (absentRecordId) {
            onLeaveUpdates.push({ id: absentRecordId, leave_request_id: leave.id });
        }
    }

    if (onLeaveUpdates.length > 0) {
        await Promise.all(
            onLeaveUpdates.map(({ id, leave_request_id }) =>
                prisma.attendance.update({
                    where: { id },
                    data: {
                        status: AttendanceStatus.ON_LEAVE,
                        leave_request_id,
                    },
                })
            )
        );
    }

    // ── Part 3: Auto clock-out yesterday's records that are still open ──
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const [endHourRaw, endMinuteRaw] = env.SHIFT_END_TIME.trim().split(":").map(Number);
    const endHour = Number.isNaN(endHourRaw) ? 17 : endHourRaw;
    const endMinute = Number.isNaN(endMinuteRaw) ? 0 : endMinuteRaw;

    const yesterdayShiftEnd = new Date(yesterday);
    yesterdayShiftEnd.setUTCHours(endHour, endMinute, 0, 0);

    const missingClockOut = await prisma.attendance.findMany({
        where: {
            date: yesterday,
            clock_in_time: { not: null },
            clock_out_time: null,
            is_informed: false,
        },
    });

    if (missingClockOut.length > 0) {
        await Promise.all(
            missingClockOut.map(record => {
                const workMinutes = record.clock_in_time
                    ? Math.floor((yesterdayShiftEnd.getTime() - record.clock_in_time.getTime()) / (1000 * 60))
                    : 0;

                return prisma.attendance.update({
                    where: { id: record.id },
                    data: {
                        clock_out_time: yesterdayShiftEnd,
                        status: AttendanceStatus.PRESENT,
                        is_auto_clocked_out: true,
                        work_minutes: workMinutes,
                        notes: record.notes
                            ? `${record.notes}\nAuto closed by system`
                            : "Auto closed by system",
                    },
                });
            })
        );
    }

    console.log(
        `[CRON] Daily attendance cron done — ${absentData.length} ABSENT created, ${onLeaveUpdates.length} ON_LEAVE updated, ${missingClockOut.length} auto closed`
    );
};


/**
 * Parses a "HH:MM" string into { hour, minute }.
 * Falls back to defaults if parsing fails.
 */
const parseCronTime = (timeStr: string, defaultHour: number, defaultMinute: number) => {
    const [hourRaw, minuteRaw] = timeStr.trim().split(":").map(Number);
    const hour = Number.isNaN(hourRaw) ? defaultHour : hourRaw;
    const minute = Number.isNaN(minuteRaw) ? defaultMinute : minuteRaw;
    return { hour, minute };
};

export const initializeCrons = () => {
    const start = parseCronTime(env.CRON_START_TIME, 0, 0);
    cron.schedule(`${start.minute} ${start.hour} * * *`, cronDailyAttendance);

    console.log(
        `Attendance cron job initialized: runs daily at ${String(start.hour).padStart(2, "0")}:${String(start.minute).padStart(2, "0")}`
    );
};
