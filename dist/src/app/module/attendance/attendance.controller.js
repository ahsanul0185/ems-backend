"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const http_status_1 = __importDefault(require("http-status"));
const attendance_service_1 = require("./attendance.service");
const clockIn = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // Assuming employee_id is available in req.user for regular clock-in
    // Or in req.body for HR clock-in
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
        return (0, sendResponse_1.sendResponse)(res, {
            httpStatusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized or missing employee_id",
            data: null,
        });
    }
    const result = await attendance_service_1.attendanceService.clockIn(employeeId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Clocked in successfully",
        data: result,
    });
});
const clockOut = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
        return (0, sendResponse_1.sendResponse)(res, {
            httpStatusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized or missing employee_id",
            data: null,
        });
    }
    const result = await attendance_service_1.attendanceService.clockOut(employeeId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Clocked out successfully",
        data: result,
    });
});
const hrClockIn = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.body?.employee_id;
    if (!employeeId) {
        return (0, sendResponse_1.sendResponse)(res, {
            httpStatusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "employee_id is required in the body for HR clock-in",
            data: null,
        });
    }
    const result = await attendance_service_1.attendanceService.clockIn(employeeId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Clocked in for employee successfully",
        data: result,
    });
});
const hrClockOut = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.body?.employee_id;
    if (!employeeId) {
        return (0, sendResponse_1.sendResponse)(res, {
            httpStatusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "employee_id is required in the body for HR clock-out",
            data: null,
        });
    }
    const result = await attendance_service_1.attendanceService.clockOut(employeeId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Clocked out for employee successfully",
        data: result,
    });
});
// const getTodayAttendance = catchAsync(async (req: Request, res: Response) => {
//     const employeeId = req.user?.employeeId as string;
//     const result = await attendanceService.getTodayAttendance(employeeId);
//     sendResponse(res, {
//         httpStatusCode: status.OK,
//         success: true,
//         message: "Today's attendance retrieved successfully",
//         data: result,
//     });
// });
const getMyAttendance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.user?.employeeId;
    const result = await attendance_service_1.attendanceService.getMyAttendance(employeeId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Attendance history retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getAllAttendance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await attendance_service_1.attendanceService.getAllAttendance(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "All attendance retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getAttendanceByEmployee = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.params.employeeId;
    const result = await attendance_service_1.attendanceService.getAttendanceByEmployee(employeeId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Employee attendance retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const hrMarkInformed = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const attendanceId = req.params.id;
    const hrProfileId = req.user?.hrProfileId; // HR user id
    const result = await attendance_service_1.attendanceService.hrMarkInformed(attendanceId, hrProfileId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Attendance marked as informed successfully",
        data: result,
    });
});
const hrUpdateRecord = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const attendanceId = req.params.id;
    const result = await attendance_service_1.attendanceService.hrUpdateRecord(attendanceId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Attendance record updated successfully",
        data: result,
    });
});
const getAttendanceDetailsById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const attendanceId = req.params.id;
    const result = await attendance_service_1.attendanceService.getAttendanceDetailsById(attendanceId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Attendance details retrieved successfully",
        data: result,
    });
});
exports.attendanceController = {
    clockIn,
    clockOut,
    hrClockIn,
    hrClockOut,
    // getTodayAttendance,
    getMyAttendance,
    getAllAttendance,
    getAttendanceByEmployee,
    hrMarkInformed,
    hrUpdateRecord,
    getAttendanceDetailsById,
};
