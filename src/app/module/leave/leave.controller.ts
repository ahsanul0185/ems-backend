import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { leaveService } from "./leave.service";
import { ILeaveQueryParams } from "./leave.interface";

const applyLeave = catchAsync(
    async (req: Request, res: Response) => {
        const employeeId = req.user?.employeeId;

        if (!employeeId) {
            throw new AppError(status.BAD_REQUEST, "Authenticated employee_id is required");
        }

        const payload = {
            ...req.body,
            employee_id: employeeId,
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
        const result = await leaveService.getLeaveById(leaveId as string);

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
        const approverId = (req.body.approver_id as string) || req.user?.userId;

        if (!approverId) {
            throw new AppError(status.BAD_REQUEST, "approver_id is required to approve");
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
        const rejectorId = (req.body.rejector_id as string) || req.user?.userId;
        const { rejection_reason } = req.body;

        if (!rejectorId) {
            throw new AppError(status.BAD_REQUEST, "rejector_id is required to reject");
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
        const employeeId = req.user?.employeeId;

        if (!employeeId) {
            throw new AppError(status.BAD_REQUEST, "Authenticated employee_id is required to cancel leave");
        }

        const result = await leaveService.cancelLeave(leaveId as string, employeeId);

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
