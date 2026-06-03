"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const announcement_service_1 = require("./announcement.service");
const getAllAnnouncements = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const queryParams = req.query;
    const user = req.user;
    const result = await announcement_service_1.announcementService.getAllAnnouncements(queryParams, {
        role: user.role,
        employeeId: user.employeeId,
    });
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Announcements retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const createAnnouncement = (0, catchAsync_1.catchAsync)(async (req, res) => {
    let payload = req.body;
    const createdBy = req.user.userId;
    const result = await announcement_service_1.announcementService.createAnnouncement(payload, createdBy);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.CREATED,
        success: true,
        message: "Announcement created successfully",
        data: result.announcement,
    });
});
const getAnnouncementById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const announcementId = req.params.id;
    const result = await announcement_service_1.announcementService.getAnnouncementById(announcementId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Announcement retrieved successfully",
        data: result.announcement,
    });
});
const updateAnnouncement = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const announcementId = req.params.id;
    const payload = req.body;
    const result = await announcement_service_1.announcementService.updateAnnouncement(announcementId, payload);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Announcement updated successfully",
        data: result.announcement,
    });
});
const deleteAnnouncement = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const announcementId = req.params.id;
    const result = await announcement_service_1.announcementService.deleteAnnouncement(announcementId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Announcement deleted successfully",
        data: result.announcement,
    });
});
const publishAnnouncement = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const announcementId = req.params.id;
    const result = await announcement_service_1.announcementService.publishAnnouncement(announcementId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Announcement published successfully",
        data: result.announcement,
    });
});
exports.announcementController = {
    getAllAnnouncements,
    createAnnouncement,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
};
