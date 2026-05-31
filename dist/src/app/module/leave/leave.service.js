"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const client_1 = require("../../../generated/prisma/client");
const applyLeave = async (payload) => {
    const { employee_id } = payload;
    const employee = await prisma_1.prisma.employee.findUnique({ where: { id: employee_id } });
    if (!employee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Employee not found");
    }
    const leave = await prisma_1.prisma.leaveRequest.create({
        data: {
            employee_id,
            title: payload.title,
            start_date: payload.start_date,
            end_date: payload.end_date,
            total_days: payload.total_days,
            reason: payload.reason,
            attachment_url: payload.attachment_url,
            leave_type: payload.leave_type,
        }
    });
    return { leave };
};
const getMyLeaves = async (employeeId, queryParams) => {
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.leaveRequest, queryParams, {
        searchableFields: ["title", "reason"],
        filterableFields: ["status", "leave_type", "employee_id"],
        defaultSelect: {
            id: true,
            title: true,
            start_date: true,
            end_date: true,
            total_days: true,
            reason: true,
            leave_type: true,
            status: true,
            applied_at: true,
        }
    })
        .where({ employee_id: employeeId })
        .search()
        .filter()
        .sort()
        .paginate();
    return builder.execute();
};
const getLeaveById = async (leaveId) => {
    const leave = await prisma_1.prisma.leaveRequest.findUnique({
        where: { id: leaveId },
        include: { employee: true, approved_emp: true },
    });
    if (!leave) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Leave request not found");
    }
    return { leave };
};
const getAllLeaves = async (queryParams) => {
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.leaveRequest, queryParams, {
        searchableFields: ["title", "reason", "employee.first_name", "employee.last_name"],
        filterableFields: ["status", "leave_type", "employee_id"],
        defaultSelect: {
            id: true,
            title: true,
            start_date: true,
            end_date: true,
            total_days: true,
            reason: true,
            leave_type: true,
            status: true,
            applied_at: true,
            employee: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                }
            }
        }
    })
        .search()
        .filter()
        .sort()
        .paginate()
        .dynamicInclude({ employee: { select: { first_name: true, last_name: true } } }, ["employee"]);
    return builder.execute();
};
const approveLeave = async (leaveId, approverId) => {
    const leave = await prisma_1.prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Leave request not found");
    }
    if (leave.status !== client_1.LeaveRequestStatus.PENDING) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Only pending requests can be approved");
    }
    const updated = await prisma_1.prisma.leaveRequest.update({
        where: { id: leaveId },
        data: {
            status: client_1.LeaveRequestStatus.APPROVED,
            approved_by: approverId,
            approved_at: new Date(),
        }
    });
    return { leave: updated };
};
const rejectLeave = async (leaveId, rejectorId, rejectionReason) => {
    const leave = await prisma_1.prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Leave request not found");
    }
    if (leave.status !== client_1.LeaveRequestStatus.PENDING) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Only pending requests can be rejected");
    }
    const updated = await prisma_1.prisma.leaveRequest.update({
        where: { id: leaveId },
        data: {
            status: client_1.LeaveRequestStatus.REJECTED,
            rejection_reason: rejectionReason,
            approved_by: rejectorId,
            approved_at: new Date(),
        }
    });
    return { leave: updated };
};
const cancelLeave = async (leaveId, employeeId) => {
    const leave = await prisma_1.prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Leave request not found");
    }
    if (employeeId && leave.employee_id !== employeeId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to cancel this leave request");
    }
    if (leave.status !== client_1.LeaveRequestStatus.PENDING) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Only pending requests can be cancelled");
    }
    const updated = await prisma_1.prisma.leaveRequest.update({
        where: { id: leaveId },
        data: {
            status: client_1.LeaveRequestStatus.CANCELLED,
        }
    });
    return { leave: updated };
};
exports.leaveService = {
    applyLeave,
    getMyLeaves,
    getLeaveById,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    cancelLeave,
};
