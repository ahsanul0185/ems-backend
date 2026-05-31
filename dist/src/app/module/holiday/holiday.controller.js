"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidayController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const http_status_1 = __importDefault(require("http-status"));
const holiday_service_1 = require("./holiday.service");
const createHoliday = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // const hrProfileId = req.user.hr_profile_id; // To get from authenticated user
    const hrProfileId = req.body.created_by; // Assuming passed in body for now if not using auth
    const result = await holiday_service_1.holidayService.createHoliday(req.body, hrProfileId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.CREATED,
        success: true,
        message: "Holiday(s) created successfully",
        data: result,
    });
});
const getAllHolidays = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await holiday_service_1.holidayService.getAllHolidays();
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Holidays retrieved successfully",
        data: result,
    });
});
exports.holidayController = {
    createHoliday,
    getAllHolidays,
};
