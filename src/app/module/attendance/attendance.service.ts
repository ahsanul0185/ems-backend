import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IClockInPayload, IClockOutPayload, IMarkInformedPayload, IUpdateAttendanceRecordPayload } from "./attendance.interface";
import { AttendanceStatus, LeaveRequestStatus } from "../../../generated/prisma/client";
import {
    calculateEarlyLeaveMinutes,
    calculateLateMinutes,
    calculateWorkMinutes,
    getExpectedShiftTimes,
    getStartOfDayUTC,
    isWeekend,
    parseTimeString,
} from "./attendance.utils";
import { QueryBuilder } from "../../utils/QueryBuilder";

const checkHolidayOrWeekend = async (date: Date) => {
    if (isWeekend(date)) {
        throw new AppError(status.BAD_REQUEST, "Cannot perform this action on a weekend (Friday)");
    }

    const startOfDay = getStartOfDayUTC(date);

    const holiday = await prisma.holiday.findFirst({
        where: { date: startOfDay }
    });

    if (holiday) {
        throw new AppError(status.BAD_REQUEST, `Cannot perform this action on a holiday: ${holiday.name}`);
    }
};
const checkEmployeeOnLeave = async (employeeId: string, date: Date) => {
    const startOfDay = getStartOfDayUTC(date);

    const activeLeave = await prisma.leaveRequest.findFirst({
        where: {
            employee_id: employeeId,
            status: LeaveRequestStatus.APPROVED,
            start_date: { lte: startOfDay },
            end_date: { gte: startOfDay },
        },
    });

    if (activeLeave) {
        throw new AppError(status.BAD_REQUEST, "Employee has an approved leave for today.");
    }
};

const clockIn = async (employeeId: string, payload: IClockInPayload) => {
    // Use provided date/time for HR backdated entries, otherwise use current time
    const clockInTime = payload.time
        ? parseTimeString(payload.date ? new Date(payload.date + "T00:00:00.000Z") : new Date(), payload.time)
        : new Date();
    const recordDate = payload.date
        ? new Date(payload.date + "T00:00:00.000Z")
        : new Date(clockInTime);

    await checkHolidayOrWeekend(recordDate);
    await checkEmployeeOnLeave(employeeId, recordDate);

    const startOfDay = payload.date
        ? new Date(payload.date + "T00:00:00.000Z")
        : getStartOfDayUTC(clockInTime);

    let attendance = await prisma.attendance.findFirst({
        where: {
            employee_id: employeeId,
            date: startOfDay,
        }
    });

    if (attendance) {
        if (attendance.status === AttendanceStatus.ON_LEAVE) {
            throw new AppError(status.BAD_REQUEST, "Employee has an approved leave for today.");
        }

        // If already clocked in (and not a soft absent record), block duplicate
        if (attendance.clock_in_time && attendance.status !== AttendanceStatus.ABSENT) {
            throw new AppError(status.BAD_REQUEST, "Already clocked in today");
        }

        // Soft absent (created by midnight cron) — overridable by HR clock-in
        if (attendance.status === AttendanceStatus.ABSENT && !attendance.is_auto_clocked_out) {
            const { expectedClockIn } = getExpectedShiftTimes(recordDate);
            const lateMinutes = calculateLateMinutes(clockInTime, expectedClockIn);

            // Build notes: append late info if applicable
            let notes = attendance.notes || "";
            if (payload.notes) {
                notes = notes ? `${notes}\n${payload.notes}` : payload.notes;
            }
            if (lateMinutes > 0) {
                const lateNote = `Late by ${lateMinutes} minute(s)`;
                notes = notes ? `${notes}\n${lateNote}` : lateNote;
            }

            attendance = await prisma.attendance.update({
                where: { id: attendance.id },
                data: {
                    clock_in_time: clockInTime,
                    status: AttendanceStatus.PRESENT,
                    late_minutes: lateMinutes,
                    notes: notes || undefined,
                }
            });
            return attendance;
        }

        // Any other state with clock_in_time already set — block
        if (attendance.clock_in_time) {
            throw new AppError(status.BAD_REQUEST, "Already clocked in today");
        }
    }

    // Normal clock-in (no existing record)
    const { expectedClockIn } = getExpectedShiftTimes(recordDate);
    const lateMinutes = calculateLateMinutes(clockInTime, expectedClockIn);

    // Build notes with late info if applicable
    let notes = payload.notes || "";
    if (lateMinutes > 0) {
        const lateNote = `Late by ${lateMinutes} minute(s)`;
        notes = notes ? `${notes}\n${lateNote}` : lateNote;
    }

    attendance = await prisma.attendance.create({
        data: {
            employee_id: employeeId,
            date: startOfDay,
            clock_in_time: clockInTime,
            status: AttendanceStatus.PRESENT,
            late_minutes: lateMinutes,
            notes: notes || undefined,
        }
    });

    return attendance;
};

const clockOut = async (employeeId: string, payload: IClockOutPayload) => {
    // Use provided date/time for HR backdated entries, otherwise use current time
    const clockOutTime = payload.time
        ? parseTimeString(payload.date ? new Date(payload.date + "T00:00:00.000Z") : new Date(), payload.time)
        : new Date();
    const recordDate = payload.date
        ? new Date(payload.date + "T00:00:00.000Z")
        : new Date(clockOutTime);

    await checkHolidayOrWeekend(recordDate);
    await checkEmployeeOnLeave(employeeId, recordDate);

    const startOfDay = payload.date
        ? new Date(payload.date + "T00:00:00.000Z")
        : getStartOfDayUTC(clockOutTime);

    const attendance = await prisma.attendance.findFirst({
        where: {
            employee_id: employeeId,
            date: startOfDay,
        }
    });

    if (!attendance || !attendance.clock_in_time) {
        throw new AppError(status.BAD_REQUEST, "Cannot clock out without clocking in first");
    }

    if (attendance.clock_out_time) {
        throw new AppError(status.BAD_REQUEST, "Already clocked out today");
    }

    if (attendance.is_informed) {
        throw new AppError(status.BAD_REQUEST, "Your attendance has been marked as informed by HR");
    }

    const { expectedClockOut } = getExpectedShiftTimes(recordDate);
    const earlyLeaveMinutes = calculateEarlyLeaveMinutes(clockOutTime, expectedClockOut);
    const workMinutes = calculateWorkMinutes(attendance.clock_in_time, clockOutTime);

    // Build notes: append early-leave info if applicable
    let notes = attendance.notes || "";
    if (payload.notes) {
        notes = notes ? `${notes}\n${payload.notes}` : payload.notes;
    }
    if (earlyLeaveMinutes > 0) {
        const earlyNote = `Left early by ${earlyLeaveMinutes} minute(s)`;
        notes = notes ? `${notes}\n${earlyNote}` : earlyNote;
    }

    return prisma.attendance.update({
        where: { id: attendance.id },
        data: {
            clock_out_time: clockOutTime,
            early_leave_minutes: earlyLeaveMinutes,
            work_minutes: workMinutes,
            notes: notes || undefined,
        }
    });
};

const getMyAttendance = async (employeeId: string, queryParams: any) => {
    const builder = new QueryBuilder(
        prisma.attendance,
        queryParams,
        { filterableFields: ["status"] }
    );
    return builder.where({ employee_id: employeeId }).filter().sort().paginate().execute();
};

const getAllAttendance = async (queryParams: any) => {
    const builder = new QueryBuilder(
        prisma.attendance,
        queryParams,
        {
            searchableFields: ["employee.first_name", "employee.last_name"],
            filterableFields: ["status", "date"],
            defaultSelect: {
                id: true,
                date: true,
                status: true,
                clock_in_time: true,
                clock_out_time: true,
                late_minutes: true,
                early_leave_minutes: true,
                work_minutes: true,
                is_informed: true,
                is_auto_clocked_out: true,
                notes: true,
                employee: {
                    select: {
                        first_name: true,
                        last_name: true,
                        employee_code: true,
                    }
                }
            }
        }
    );
    return builder.search().filter().sort().paginate().execute();
};

const getAttendanceByEmployee = async (employeeId: string, queryParams: any) => {
    const builder = new QueryBuilder(
        prisma.attendance,
        queryParams,
        { filterableFields: ["status", "date"] }
    );
    return builder.where({ employee_id: employeeId }).filter().sort().paginate().execute();
};

const hrMarkInformed = async (attendanceId: string, hrProfileId: string, payload: IMarkInformedPayload) => {
    const attendance = await prisma.attendance.findUnique({
        where: { id: attendanceId }
    });

    if (!attendance) {
        throw new AppError(status.NOT_FOUND, "Attendance record not found");
    }

    if (!attendance.clock_in_time) {
        throw new AppError(status.BAD_REQUEST, "Employee hasn't clocked in yet");
    }

    if (attendance.is_informed) {
        throw new AppError(status.BAD_REQUEST, "Attendance is already marked as informed");
    }

    const now = new Date();
    const { expectedClockOut } = getExpectedShiftTimes(attendance.date);

    // If employee already clocked out, preserve the existing clock-out time and calculations.
    // Only mark as informed and store metadata.
    if (attendance.clock_out_time) {
        return prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                is_informed: true,
                informed_reason: payload.informed_reason,
                informed_at: now,
                informed_by: hrProfileId,
                status: AttendanceStatus.INFORMED,
            }
        });
    }

    // Employee hasn't clocked out yet — close the record now.
    const earlyLeaveMinutes = expectedClockOut > now
        ? Math.floor((expectedClockOut.getTime() - now.getTime()) / (1000 * 60))
        : 0;
    const workMinutes = calculateWorkMinutes(attendance.clock_in_time, now);

    return prisma.attendance.update({
        where: { id: attendanceId },
        data: {
            is_informed: true,
            informed_reason: payload.informed_reason,
            informed_at: now,
            informed_by: hrProfileId,
            clock_out_time: now,
            status: AttendanceStatus.INFORMED,
            early_leave_minutes: earlyLeaveMinutes,
            work_minutes: workMinutes,
        }
    });
};

const hrUpdateRecord = async (attendanceId: string, payload: IUpdateAttendanceRecordPayload) => {
    const attendance = await prisma.attendance.findUnique({
        where: { id: attendanceId }
    });

    if (!attendance) {
        throw new AppError(status.NOT_FOUND, "Attendance record not found");
    }

    // Use payload values if provided, otherwise keep existing DB values
    const clockIn = payload.clock_in_time
        ? parseTimeString(attendance.date, payload.clock_in_time)
        : attendance.clock_in_time;
    const clockOut = payload.clock_out_time
        ? parseTimeString(attendance.date, payload.clock_out_time)
        : attendance.clock_out_time;

    const { expectedClockIn, expectedClockOut } = getExpectedShiftTimes(attendance.date);

    // Only recalculate derived fields when the relevant times are present;
    // otherwise preserve the existing stored values (avoids resetting to 0)
    const lateMinutes = clockIn
        ? calculateLateMinutes(clockIn, expectedClockIn)
        : attendance.late_minutes;

    const earlyLeaveMinutes = clockOut
        ? calculateEarlyLeaveMinutes(clockOut, expectedClockOut)
        : attendance.early_leave_minutes;

    const workMinutes = clockIn && clockOut
        ? calculateWorkMinutes(clockIn, clockOut)
        : attendance.work_minutes;

    return prisma.attendance.update({
        where: { id: attendanceId },
        data: {
            clock_in_time: clockIn,
            clock_out_time: clockOut,
            status: payload.status,
            late_minutes: lateMinutes,
            early_leave_minutes: earlyLeaveMinutes,
            work_minutes: workMinutes,
            // ?? so empty string clears notes; undefined keeps existing
            notes: payload.notes ?? attendance.notes,
        }
    });
};

const getAttendanceDetailsById = async (attendanceId: string) => {
    const attendance = await prisma.attendance.findUnique({
        where: { id: attendanceId },
        include: {
            employee: {
                select: {
                    first_name: true,
                    last_name: true,
                    employee_code: true,
                    department: { select: { name: true } }
                }
            },
            informed_by_hr: {
                include: {
                    employee: { select: { first_name: true, last_name: true } }
                }
            },
            leave_request: true,
        }
    });

    if (!attendance) {
        throw new AppError(status.NOT_FOUND, "Attendance record not found");
    }

    return attendance;
};

export const attendanceService = {
    clockIn,
    clockOut,
    getMyAttendance,
    getAllAttendance,
    getAttendanceByEmployee,
    hrMarkInformed,
    hrUpdateRecord,
    getAttendanceDetailsById,
};
