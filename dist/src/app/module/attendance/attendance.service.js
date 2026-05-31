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
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const holiday = await prisma_1.prisma.holiday.findFirst({
        where: {
            date: startOfDay,
        }
    });
    if (holiday) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Cannot perform this action on a holiday: ${holiday.name}`);
    }
};
const clockIn = async (employeeId, payload) => {
    const now = new Date();
    await checkHolidayOrWeekend(now);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    let attendance = await prisma_1.prisma.attendance.findFirst({
        where: {
            employee_id: employeeId,
            date: startOfDay,
        }
    });
    if (attendance) {
        if (attendance.status === client_1.AttendanceStatus.ON_LEAVE) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have an approved leave for today.");
        }
        if (attendance.status === client_1.AttendanceStatus.ABSENT && !attendance.is_auto_clocked_out) {
            // Case 2: Soft absent, overridable
            const { expectedClockIn } = (0, attendance_utils_1.getExpectedShiftTimes)(now);
            const lateMinutes = (0, attendance_utils_1.calculateLateMinutes)(now, expectedClockIn);
            attendance = await prisma_1.prisma.attendance.update({
                where: { id: attendance.id },
                data: {
                    clock_in_time: now,
                    status: client_1.AttendanceStatus.PRESENT,
                    late_minutes: lateMinutes,
                    notes: payload.notes || attendance.notes,
                }
            });
            return attendance;
        }
        if (attendance.clock_in_time) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Already clocked in today");
        }
    }
    // Normal Case 1
    const { expectedClockIn } = (0, attendance_utils_1.getExpectedShiftTimes)(now);
    const lateMinutes = (0, attendance_utils_1.calculateLateMinutes)(now, expectedClockIn);
    attendance = await prisma_1.prisma.attendance.create({
        data: {
            employee_id: employeeId,
            date: startOfDay,
            clock_in_time: now,
            status: client_1.AttendanceStatus.PRESENT,
            late_minutes: lateMinutes,
            notes: payload.notes,
        }
    });
    return attendance;
};
const clockOut = async (employeeId, payload) => {
    const now = new Date();
    await checkHolidayOrWeekend(now);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
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
    const { expectedClockOut } = (0, attendance_utils_1.getExpectedShiftTimes)(now);
    const earlyLeaveMinutes = (0, attendance_utils_1.calculateEarlyLeaveMinutes)(now, expectedClockOut);
    const workMinutes = (0, attendance_utils_1.calculateWorkMinutes)(attendance.clock_in_time, now);
    const updatedAttendance = await prisma_1.prisma.attendance.update({
        where: { id: attendance.id },
        data: {
            clock_out_time: now,
            early_leave_minutes: earlyLeaveMinutes,
            work_minutes: workMinutes,
            notes: payload.notes || attendance.notes,
        }
    });
    return updatedAttendance;
};
// const getTodayAttendance = async (employeeId: string) => {
//     const now = new Date();
//     const startOfDay = new Date(now);
//     startOfDay.setHours(0, 0, 0, 0);
//     const attendance = await prisma.attendance.findFirst({
//         where: {
//             employee_id: employeeId,
//             date: startOfDay,
//         }
//     });
//     return attendance;
// };
const getMyAttendance = async (employeeId, queryParams) => {
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.attendance, queryParams, {
        filterableFields: ["status"],
    });
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
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.attendance, queryParams, {
        filterableFields: ["status", "date"],
    });
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
    const now = new Date();
    const { expectedClockOut } = (0, attendance_utils_1.getExpectedShiftTimes)(attendance.date);
    // Shift end could be later today, so early leave is calculated from now till shift end
    const earlyLeaveMinutes = expectedClockOut > now ? Math.floor((expectedClockOut.getTime() - now.getTime()) / (1000 * 60)) : 0;
    const workMinutes = (0, attendance_utils_1.calculateWorkMinutes)(attendance.clock_in_time, now);
    const updated = await prisma_1.prisma.attendance.update({
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
    return updated;
};
const hrUpdateRecord = async (attendanceId, payload) => {
    const attendance = await prisma_1.prisma.attendance.findUnique({
        where: { id: attendanceId }
    });
    if (!attendance) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Attendance record not found");
    }
    if (attendance.is_informed) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Cannot edit an INFORMED record");
    }
    const clockIn = payload.clock_in_time ? new Date(payload.clock_in_time) : attendance.clock_in_time;
    const clockOut = payload.clock_out_time ? new Date(payload.clock_out_time) : attendance.clock_out_time;
    let lateMinutes = 0;
    let earlyLeaveMinutes = 0;
    let workMinutes = 0;
    const { expectedClockIn, expectedClockOut } = (0, attendance_utils_1.getExpectedShiftTimes)(attendance.date);
    if (clockIn) {
        lateMinutes = (0, attendance_utils_1.calculateLateMinutes)(clockIn, expectedClockIn);
    }
    if (clockOut) {
        earlyLeaveMinutes = (0, attendance_utils_1.calculateEarlyLeaveMinutes)(clockOut, expectedClockOut);
    }
    if (clockIn && clockOut) {
        workMinutes = (0, attendance_utils_1.calculateWorkMinutes)(clockIn, clockOut);
    }
    const updated = await prisma_1.prisma.attendance.update({
        where: { id: attendanceId },
        data: {
            clock_in_time: clockIn,
            clock_out_time: clockOut,
            status: payload.status,
            late_minutes: lateMinutes,
            early_leave_minutes: earlyLeaveMinutes,
            work_minutes: workMinutes,
            notes: payload.notes || attendance.notes,
        }
    });
    return updated;
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
                    department: {
                        select: {
                            name: true,
                        }
                    }
                }
            },
            informed_by_hr: {
                include: {
                    employee: {
                        select: {
                            first_name: true,
                            last_name: true,
                        }
                    }
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
    // getTodayAttendance,
    getMyAttendance,
    getAllAttendance,
    getAttendanceByEmployee,
    hrMarkInformed,
    hrUpdateRecord,
    getAttendanceDetailsById,
};
