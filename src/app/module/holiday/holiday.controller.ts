import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { holidayService } from "./holiday.service";

const createHoliday = catchAsync(async (req: Request, res: Response) => {
    // const hrProfileId = req.user.hr_profile_id; // To get from authenticated user
    const hrProfileId = req.body.created_by; // Assuming passed in body for now if not using auth

    const result = await holidayService.createHoliday(req.body, hrProfileId);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Holiday(s) created successfully",
        data: result,
    });
});

const getAllHolidays = catchAsync(async (req: Request, res: Response) => {
    const result = await holidayService.getAllHolidays();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Holidays retrieved successfully",
        data: result,
    });
});

export const holidayController = {
    createHoliday,
    getAllHolidays,
};
