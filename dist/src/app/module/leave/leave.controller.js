"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const leave_service_1 = require("./leave.service");
const applyLeave = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Authenticated employee_id is required");
    }
    const payload = {
        ...req.body,
        employee_id: employeeId,
    };
    const result = await leave_service_1.leaveService.applyLeave(payload);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.CREATED,
        success: true,
        message: "Leave applied successfully",
        data: result.leave,
    });
});
const getMyLeaves = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.user?.employeeId;
    const queryParams = req.query;
    if (!employeeId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Authenticated employee_id is required to fetch personal leaves");
    }
    const result = await leave_service_1.leaveService.getMyLeaves(employeeId, queryParams);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Leaves retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getAllLeaves = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const queryParams = req.query;
    const result = await leave_service_1.leaveService.getAllLeaves(queryParams);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Leaves retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getLeaveById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const leaveId = req.params.id;
    const result = await leave_service_1.leaveService.getLeaveById(leaveId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Leave retrieved successfully",
        data: result.leave,
    });
});
const approveLeave = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const leaveId = req.params.id;
    const approverId = req.body.approver_id || req.user?.userId;
    if (!approverId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "approver_id is required to approve");
    }
    const result = await leave_service_1.leaveService.approveLeave(leaveId, approverId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Leave approved successfully",
        data: result.leave,
    });
});
const rejectLeave = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const leaveId = req.params.id;
    const rejectorId = req.body.rejector_id || req.user?.userId;
    const { rejection_reason } = req.body;
    if (!rejectorId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "rejector_id is required to reject");
    }
    const result = await leave_service_1.leaveService.rejectLeave(leaveId, rejectorId, rejection_reason);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Leave rejected successfully",
        data: result.leave,
    });
});
const cancelLeave = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const leaveId = req.params.id;
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Authenticated employee_id is required to cancel leave");
    }
    const result = await leave_service_1.leaveService.cancelLeave(leaveId, employeeId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Leave cancelled successfully",
        data: {
            leave: result.leave,
        }
    });
});
exports.leaveController = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    getLeaveById,
    approveLeave,
    rejectLeave,
    cancelLeave,
};
