import cron from "node-cron";
import { prisma } from "../../lib/prisma";
import { AttendanceStatus, EmployeeStatus, LeaveRequestStatus } from "../../../generated/prisma/client";
import { isWeekend, getStartOfDayUTC } from "./attendance.utils";
import { env } from "../../config/env";

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


export const initializeCrons = () => {
    const [startHourRaw, startMinuteRaw] = env.SHIFT_START_TIME.trim().split(":").map(Number);
    const [endHourRaw, endMinuteRaw] = env.SHIFT_END_TIME.trim().split(":").map(Number);

    const startHour = Number.isNaN(startHourRaw) ? 9 : startHourRaw;
    const startMinute = Number.isNaN(startMinuteRaw) ? 0 : startMinuteRaw;
    const endHour = Number.isNaN(endHourRaw) ? 17 : endHourRaw;
    const endMinute = Number.isNaN(endMinuteRaw) ? 0 : endMinuteRaw;

    // Schedule cron 1 (15 minutes after shift start)
    const cron1Minute = (startMinute + 15) % 60;
    const cron1Hour = startHour + Math.floor((startMinute + 15) / 60);
    cron.schedule(`${cron1Minute} ${cron1Hour} * * *`, cronClockIn);

    // Schedule cron 2 (exactly at shift end)
    cron.schedule(`${endMinute} ${endHour} * * *`, cronClockOut);

    console.log(`Attendance cron jobs initialized at ${cron1Hour}:${cron1Minute.toString().padStart(2, "0")} and ${endHour}:${endMinute.toString().padStart(2, "0")}`);
};
