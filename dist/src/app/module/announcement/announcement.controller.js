import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { announcementService } from "./announcement.service";
const getAllAnnouncements = catchAsync(async (req, res) => {
    const queryParams = req.query;
    const user = req.user;
    const result = await announcementService.getAllAnnouncements(queryParams, {
        role: user.role,
        employeeId: user.employeeId,
    });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Announcements retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const createAnnouncement = catchAsync(async (req, res) => {
    const payload = req.body;
    const createdBy = req.user.userId;
    const result = await announcementService.createAnnouncement(payload, createdBy);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Announcement created successfully",
        data: result.announcement,
    });
});
const getAnnouncementById = catchAsync(async (req, res) => {
    const announcementId = req.params.id;
    const result = await announcementService.getAnnouncementById(announcementId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Announcement retrieved successfully",
        data: result.announcement,
    });
});
const updateAnnouncement = catchAsync(async (req, res) => {
    const announcementId = req.params.id;
    const payload = req.body;
    const result = await announcementService.updateAnnouncement(announcementId, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Announcement updated successfully",
        data: result.announcement,
    });
});
const deleteAnnouncement = catchAsync(async (req, res) => {
    const announcementId = req.params.id;
    const result = await announcementService.deleteAnnouncement(announcementId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Announcement deleted successfully",
        data: result.announcement,
    });
});
const publishAnnouncement = catchAsync(async (req, res) => {
    const announcementId = req.params.id;
    const result = await announcementService.publishAnnouncement(announcementId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Announcement published successfully",
        data: result.announcement,
    });
});
export const announcementController = {
    getAllAnnouncements,
    createAnnouncement,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
};
