import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { UserRole } from "../../../generated/prisma/enums";
import { leaveService } from "./leave.service";
import { ILeaveQueryParams } from "./leave.interface";

const applyLeave = catchAsync(
    async (req: Request, res: Response) => {
        const userRole = req.user?.role;
        const employeeId = req.user?.employeeId;
        const bodyEmployeeId = req.body.employee_id as string | undefined;

        // HR/Admin can create leave for any employee by passing employee_id
        // Regular employees must have their own employee_id from auth
        let targetEmployeeId: string;

        if (bodyEmployeeId && (userRole === UserRole.HR || userRole === UserRole.ADMIN)) {
            targetEmployeeId = bodyEmployeeId;
        } else {
            if (!employeeId) {
                throw new AppError(status.BAD_REQUEST, "Authenticated employee_id is required");
            }
            targetEmployeeId = employeeId;
        }

        const payload = {
            ...req.body,
            employee_id: targetEmployeeId,
        };

        const result = await leaveService.applyLeave(payload);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Leave applied successfully",
            data: result.leave,
        })
    }
)

const getMyLeaves = catchAsync(
    async (req: Request, res: Response) => {
        const employeeId = req.user?.employeeId;
        const queryParams = req.query as unknown as ILeaveQueryParams;

        if (!employeeId) {
            throw new AppError(status.BAD_REQUEST, "Authenticated employee_id is required to fetch personal leaves");
        }

        const result = await leaveService.getMyLeaves(employeeId, queryParams);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Leaves retrieved successfully",
            data: result.data,
            meta: result.meta,
        })
    }
)

const getAllLeaves = catchAsync(
    async (req: Request, res: Response) => {
        const queryParams = req.query as unknown as ILeaveQueryParams;
        const result = await leaveService.getAllLeaves(queryParams);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Leaves retrieved successfully",
            data: result.data,
            meta: result.meta,
        })
    }
)

const getLeaveById = catchAsync(
    async (req: Request, res: Response) => {
        const leaveId = req.params.id;
        const userRole = req.user?.role;
        const employeeId = req.user?.employeeId;

        const result = await leaveService.getLeaveById(leaveId as string, userRole, employeeId);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Leave retrieved successfully",
            data: result.leave,
        })
    }
)

const approveLeave = catchAsync(
    async (req: Request, res: Response) => {
        const leaveId = req.params.id;
        const userRole = req.user?.role;
        const approverId = req.user?.userId;

        if (userRole !== UserRole.HR && userRole !== UserRole.ADMIN) {
            throw new AppError(status.FORBIDDEN, "Only HR or Admin can approve leave requests");
        }

        const result = await leaveService.approveLeave(leaveId as string, approverId);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Leave approved successfully",
            data: result.leave,
        })
    }
)

const rejectLeave = catchAsync(
    async (req: Request, res: Response) => {
        const leaveId = req.params.id;
        const userRole = req.user?.role;
        const rejectorId = req.user?.userId;
        const { rejection_reason } = req.body;

        if (userRole !== UserRole.HR && userRole !== UserRole.ADMIN) {
            throw new AppError(status.FORBIDDEN, "Only HR or Admin can reject leave requests");
        }

        const result = await leaveService.rejectLeave(leaveId as string, rejectorId, rejection_reason);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Leave rejected successfully",
            data: result.leave,
        })
    }
)

const cancelLeave = catchAsync(
    async (req: Request, res: Response) => {
        const leaveId = req.params.id;
        const userRole = req.user?.role;
        const employeeId = req.user?.employeeId;

        if (!employeeId) {
            throw new AppError(status.BAD_REQUEST, "Authenticated employee_id is required to cancel leave");
        }

        // HR/Admin can cancel any leave; employees can only cancel their own
        const targetEmployeeId = (userRole === UserRole.HR || userRole === UserRole.ADMIN)
            ? undefined
            : employeeId;

        const result = await leaveService.cancelLeave(leaveId as string, targetEmployeeId);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Leave cancelled successfully",
            data: {
                leave: result.leave,
            }
        })
    }
)

export const leaveController = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    getLeaveById,
    approveLeave,
    rejectLeave,
    cancelLeave,
};
