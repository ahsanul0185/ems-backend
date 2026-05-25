import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { attendanceService } from "./attendance.service";
const clockIn = catchAsync(async (req, res) => {
    // Assuming employee_id is available in req.user for regular clock-in
    // Or in req.body for HR clock-in
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
        return sendResponse(res, {
            httpStatusCode: status.UNAUTHORIZED,
            success: false,
            message: "Unauthorized or missing employee_id",
            data: null,
        });
    }
    const result = await attendanceService.clockIn(employeeId, req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Clocked in successfully",
        data: result,
    });
});
const clockOut = catchAsync(async (req, res) => {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
        return sendResponse(res, {
            httpStatusCode: status.UNAUTHORIZED,
            success: false,
            message: "Unauthorized or missing employee_id",
            data: null,
        });
    }
    const result = await attendanceService.clockOut(employeeId, req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Clocked out successfully",
        data: result,
    });
});
const hrClockIn = catchAsync(async (req, res) => {
    const employeeId = req.body?.employee_id;
    if (!employeeId) {
        return sendResponse(res, {
            httpStatusCode: status.BAD_REQUEST,
            success: false,
            message: "employee_id is required in the body for HR clock-in",
            data: null,
        });
    }
    const result = await attendanceService.clockIn(employeeId, req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Clocked in for employee successfully",
        data: result,
    });
});
const hrClockOut = catchAsync(async (req, res) => {
    const employeeId = req.body?.employee_id;
    if (!employeeId) {
        return sendResponse(res, {
            httpStatusCode: status.BAD_REQUEST,
            success: false,
            message: "employee_id is required in the body for HR clock-out",
            data: null,
        });
    }
    const result = await attendanceService.clockOut(employeeId, req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
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
const getMyAttendance = catchAsync(async (req, res) => {
    const employeeId = req.user?.employeeId;
    const result = await attendanceService.getMyAttendance(employeeId, req.query);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Attendance history retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getAllAttendance = catchAsync(async (req, res) => {
    const result = await attendanceService.getAllAttendance(req.query);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "All attendance retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getAttendanceByEmployee = catchAsync(async (req, res) => {
    const employeeId = req.params.employeeId;
    const result = await attendanceService.getAttendanceByEmployee(employeeId, req.query);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee attendance retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const hrMarkInformed = catchAsync(async (req, res) => {
    const attendanceId = req.params.id;
    const hrProfileId = req.user?.hrProfileId; // HR user id
    const result = await attendanceService.hrMarkInformed(attendanceId, hrProfileId, req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Attendance marked as informed successfully",
        data: result,
    });
});
const hrUpdateRecord = catchAsync(async (req, res) => {
    const attendanceId = req.params.id;
    const result = await attendanceService.hrUpdateRecord(attendanceId, req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Attendance record updated successfully",
        data: result,
    });
});
const getAttendanceDetailsById = catchAsync(async (req, res) => {
    const attendanceId = req.params.id;
    const result = await attendanceService.getAttendanceDetailsById(attendanceId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Attendance details retrieved successfully",
        data: result,
    });
});
export const attendanceController = {
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
