"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payslipController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const payslip_service_1 = require("./payslip.service");
const getMyPayslips = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.user?.employeeId;
    const queryParams = req.query;
    if (!employeeId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Authenticated employee_id is required to fetch payslips");
    }
    const result = await payslip_service_1.payslipService.getMyPayslips(employeeId, queryParams);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Payslips retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getMyPayslipById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.user?.employeeId;
    const payslipId = req.params.id;
    if (!employeeId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Authenticated employee_id is required to fetch the payslip");
    }
    const result = await payslip_service_1.payslipService.getMyPayslipById(payslipId, employeeId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Payslip retrieved successfully",
        data: result.payslip
    });
});
const getAllPayslips = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const queryParams = req.query;
    const result = await payslip_service_1.payslipService.getAllPayslips(queryParams);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Payslips retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const generatePayslip = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Authenticated user is required to generate payslips");
    }
    const payload = req.body;
    const result = await payslip_service_1.payslipService.generatePayslip(payload, userId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.CREATED,
        success: true,
        message: "Payslip generated successfully",
        data: result.payslip,
    });
});
const getPayslipById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payslipId = req.params.id;
    const result = await payslip_service_1.payslipService.getPayslipById(payslipId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Payslip retrieved successfully",
        data: result.payslip,
    });
});
const approvePayslip = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payslipId = req.params.id;
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Authenticated user is required to approve payslips");
    }
    const result = await payslip_service_1.payslipService.approvePayslip(payslipId, userId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Payslip approved successfully",
        data: result.payslip,
    });
});
const markPaidPayslip = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payslipId = req.params.id;
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Authenticated user is required to mark payslips as paid");
    }
    const result = await payslip_service_1.payslipService.markPaidPayslip(payslipId, userId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Payslip marked as paid successfully",
        data: result.payslip,
    });
});
exports.payslipController = {
    getMyPayslips,
    getMyPayslipById,
    getAllPayslips,
    generatePayslip,
    getPayslipById,
    approvePayslip,
    markPaidPayslip,
};
