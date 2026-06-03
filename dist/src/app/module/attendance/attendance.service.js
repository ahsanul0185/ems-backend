"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const client_1 = require("../../../generated/prisma/client");
const attendance_utils_1 = require("./attendance.utils");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const checkHolidayOrWeekend = async (date) => {
    if ((0, attendance_utils_1.isWeekend)(date)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Cannot perform this action on a weekend (Friday)");
    }
    const startOfDay = (0, attendance_utils_1.getStartOfDayUTC)(date);
    const holiday = await prisma_1.prisma.holiday.findFirst({
        where: { date: startOfDay }
    });
    if (holiday) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Cannot perform this action on a holiday: ${holiday.name}`);
    }
};
const clockIn = async (employeeId, payload) => {
    // Use provided date/time for HR backdated entries, otherwise use current time
    const clockInTime = payload.time
        ? (0, attendance_utils_1.parseTimeString)(payload.date ? new Date(payload.date + "T00:00:00.000Z") : new Date(), payload.time)
        : new Date();
    const recordDate = payload.date
        ? new Date(payload.date + "T00:00:00.000Z")
        : new Date(clockInTime);
    await checkHolidayOrWeekend(recordDate);
    const startOfDay = payload.date
        ? new Date(payload.date + "T00:00:00.000Z")
        : (0, attendance_utils_1.getStartOfDayUTC)(clockInTime);
    let attendance = await prisma_1.prisma.attendance.findFirst({
        where: {
            employee_id: employeeId,
            date: startOfDay,
        }
    });
    if (attendance) {
        if (attendance.status === client_1.AttendanceStatus.ON_LEAVE) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Employee has an approved leave for today.");
        }
        // If already clocked in (and not a soft absent record), block duplicate
        if (attendance.clock_in_time && attendance.status !== client_1.AttendanceStatus.ABSENT) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Already clocked in today");
        }
        // Soft absent (created by midnight cron) — overridable by HR clock-in
        if (attendance.status === client_1.AttendanceStatus.ABSENT && !attendance.is_auto_clocked_out) {
            const { expectedClockIn } = (0, attendance_utils_1.getExpectedShiftTimes)(recordDate);
            const lateMinutes = (0, attendance_utils_1.calculateLateMinutes)(clockInTime, expectedClockIn);
            // Build notes: append late info if applicable
            let notes = attendance.notes || "";
            if (payload.notes) {
                notes = notes ? `${notes}\n${payload.notes}` : payload.notes;
            }
            if (lateMinutes > 0) {
                const lateNote = `Late by ${lateMinutes} minute(s)`;
                notes = notes ? `${notes}\n${lateNote}` : lateNote;
            }
            attendance = await prisma_1.prisma.attendance.update({
                where: { id: attendance.id },
                data: {
                    clock_in_time: clockInTime,
                    status: client_1.AttendanceStatus.PRESENT,
                    late_minutes: lateMinutes,
                    notes: notes || undefined,
                }
            });
            return attendance;
        }
        // Any other state with clock_in_time already set — block
        if (attendance.clock_in_time) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Already clocked in today");
        }
    }
    // Normal clock-in (no existing record)
    const { expectedClockIn } = (0, attendance_utils_1.getExpectedShiftTimes)(recordDate);
    const lateMinutes = (0, attendance_utils_1.calculateLateMinutes)(clockInTime, expectedClockIn);
    // Build notes with late info if applicable
    let notes = payload.notes || "";
    if (lateMinutes > 0) {
        const lateNote = `Late by ${lateMinutes} minute(s)`;
        notes = notes ? `${notes}\n${lateNote}` : lateNote;
    }
    attendance = await prisma_1.prisma.attendance.create({
        data: {
            employee_id: employeeId,
            date: startOfDay,
            clock_in_time: clockInTime,
            status: client_1.AttendanceStatus.PRESENT,
            late_minutes: lateMinutes,
            notes: notes || undefined,
        }
    });
    return attendance;
};
const clockOut = async (employeeId, payload) => {
    // Use provided date/time for HR backdated entries, otherwise use current time
    const clockOutTime = payload.time
        ? (0, attendance_utils_1.parseTimeString)(payload.date ? new Date(payload.date + "T00:00:00.000Z") : new Date(), payload.time)
        : new Date();
    const recordDate = payload.date
        ? new Date(payload.date + "T00:00:00.000Z")
        : new Date(clockOutTime);
    await checkHolidayOrWeekend(recordDate);
    const startOfDay = payload.date
        ? new Date(payload.date + "T00:00:00.000Z")
        : (0, attendance_utils_1.getStartOfDayUTC)(clockOutTime);
    const attendance = await prisma_1.prisma.attendance.findFirst({
        where: {
            employee_id: employeeId,
            date: startOfDay,
        }
    });
    if (!attendance || !attendance.clock_in_time) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Cannot clock out without clocking in first");
    }
    if (attendance.clock_out_time) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Already clocked out today");
    }
    if (attendance.is_informed) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Your attendance has been marked as informed by HR");
    }
    const { expectedClockOut } = (0, attendance_utils_1.getExpectedShiftTimes)(recordDate);
    const earlyLeaveMinutes = (0, attendance_utils_1.calculateEarlyLeaveMinutes)(clockOutTime, expectedClockOut);
    const workMinutes = (0, attendance_utils_1.calculateWorkMinutes)(attendance.clock_in_time, clockOutTime);
    // Build notes: append early-leave info if applicable
    let notes = attendance.notes || "";
    if (payload.notes) {
        notes = notes ? `${notes}\n${payload.notes}` : payload.notes;
    }
    if (earlyLeaveMinutes > 0) {
        const earlyNote = `Left early by ${earlyLeaveMinutes} minute(s)`;
        notes = notes ? `${notes}\n${earlyNote}` : earlyNote;
    }
    return prisma_1.prisma.attendance.update({
        where: { id: attendance.id },
        data: {
            clock_out_time: clockOutTime,
            early_leave_minutes: earlyLeaveMinutes,
            work_minutes: workMinutes,
            notes: notes || undefined,
        }
    });
};
const getMyAttendance = async (employeeId, queryParams) => {
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.attendance, queryParams, { filterableFields: ["status"] });
    return builder.where({ employee_id: employeeId }).filter().sort().paginate().execute();
};
const getAllAttendance = async (queryParams) => {
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.attendance, queryParams, {
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
    });
    return builder.search().filter().sort().paginate().execute();
};
const getAttendanceByEmployee = async (employeeId, queryParams) => {
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.attendance, queryParams, { filterableFields: ["status", "date"] });
    return builder.where({ employee_id: employeeId }).filter().sort().paginate().execute();
};
const hrMarkInformed = async (attendanceId, hrProfileId, payload) => {
    const attendance = await prisma_1.prisma.attendance.findUnique({
        where: { id: attendanceId }
    });
    if (!attendance) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Attendance record not found");
    }
    if (!attendance.clock_in_time) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Employee hasn't clocked in yet");
    }
    if (attendance.is_informed) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Attendance is already marked as informed");
    }
    const now = new Date();
    const { expectedClockOut } = (0, attendance_utils_1.getExpectedShiftTimes)(attendance.date);
    // If employee already clocked out, preserve the existing clock-out time and calculations.
    // Only mark as informed and store metadata.
    if (attendance.clock_out_time) {
        return prisma_1.prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                is_informed: true,
                informed_reason: payload.informed_reason,
                informed_at: now,
                informed_by: hrProfileId,
                status: client_1.AttendanceStatus.INFORMED,
            }
        });
    }
    // Employee hasn't clocked out yet — close the record now.
    const earlyLeaveMinutes = expectedClockOut > now
        ? Math.floor((expectedClockOut.getTime() - now.getTime()) / (1000 * 60))
        : 0;
    const workMinutes = (0, attendance_utils_1.calculateWorkMinutes)(attendance.clock_in_time, now);
    return prisma_1.prisma.attendance.update({
        where: { id: attendanceId },
        data: {
            is_informed: true,
            informed_reason: payload.informed_reason,
            informed_at: now,
            informed_by: hrProfileId,
            clock_out_time: now,
            status: client_1.AttendanceStatus.INFORMED,
            early_leave_minutes: earlyLeaveMinutes,
            work_minutes: workMinutes,
        }
    });
};
const hrUpdateRecord = async (attendanceId, payload) => {
    const attendance = await prisma_1.prisma.attendance.findUnique({
        where: { id: attendanceId }
    });
    if (!attendance) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Attendance record not found");
    }
    // Use payload values if provided, otherwise keep existing DB values
    const clockIn = payload.clock_in_time
        ? (0, attendance_utils_1.parseTimeString)(attendance.date, payload.clock_in_time)
        : attendance.clock_in_time;
    const clockOut = payload.clock_out_time
        ? (0, attendance_utils_1.parseTimeString)(attendance.date, payload.clock_out_time)
        : attendance.clock_out_time;
    const { expectedClockIn, expectedClockOut } = (0, attendance_utils_1.getExpectedShiftTimes)(attendance.date);
    // Only recalculate derived fields when the relevant times are present;
    // otherwise preserve the existing stored values (avoids resetting to 0)
    const lateMinutes = clockIn
        ? (0, attendance_utils_1.calculateLateMinutes)(clockIn, expectedClockIn)
        : attendance.late_minutes;
    const earlyLeaveMinutes = clockOut
        ? (0, attendance_utils_1.calculateEarlyLeaveMinutes)(clockOut, expectedClockOut)
        : attendance.early_leave_minutes;
    const workMinutes = clockIn && clockOut
        ? (0, attendance_utils_1.calculateWorkMinutes)(clockIn, clockOut)
        : attendance.work_minutes;
    return prisma_1.prisma.attendance.update({
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
const getAttendanceDetailsById = async (attendanceId) => {
    const attendance = await prisma_1.prisma.attendance.findUnique({
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
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Attendance record not found");
    }
    return attendance;
};
exports.attendanceService = {
    clockIn,
    clockOut,
    getMyAttendance,
    getAllAttendance,
    getAttendanceByEmployee,
    hrMarkInformed,
    hrUpdateRecord,
    getAttendanceDetailsById,
};
