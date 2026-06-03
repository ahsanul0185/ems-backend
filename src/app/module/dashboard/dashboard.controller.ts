import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { dashboardService } from "./dashboard.service";
import status from "http-status";

const getAdminDashboardData = catchAsync(
    async (req: Request, res: Response) => {
        const result = await dashboardService.getAdminDashboardData();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Dashboard data fetched successfully",
            data: result,
        });
    }
);

const getHrDashboardData = catchAsync(
    async (req: Request, res: Response) => {
        const result = await dashboardService.getHrDashboardData();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Dashboard data fetched successfully",
            data: result,
        });
    }
);

export const dashboardController = {
    getAdminDashboardData,
    getHrDashboardData,
};
