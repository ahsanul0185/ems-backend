import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { announcementService } from "./announcement.service";
import { IAnnouncementQueryParams } from "./announcement.interface";

const getAllAnnouncements = catchAsync(
  async (req: Request, res: Response) => {
    const queryParams = req.query as unknown as IAnnouncementQueryParams;
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
  }
);

const createAnnouncement = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const createdBy = req.user.userId;
    const result = await announcementService.createAnnouncement(payload, createdBy);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Announcement created successfully",
      data: result.announcement,
    });
  }
);

const getAnnouncementById = catchAsync(
  async (req: Request, res: Response) => {
    const announcementId = req.params.id;
    const result = await announcementService.getAnnouncementById(announcementId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Announcement retrieved successfully",
      data: result.announcement,
    });
  }
);

const updateAnnouncement = catchAsync(
  async (req: Request, res: Response) => {
    const announcementId = req.params.id;
    const payload = req.body;
    const result = await announcementService.updateAnnouncement(announcementId as string, payload);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Announcement updated successfully",
      data: result.announcement,
    });
  }
);

const deleteAnnouncement = catchAsync(
  async (req: Request, res: Response) => {
    const announcementId = req.params.id;
    const result = await announcementService.deleteAnnouncement(announcementId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Announcement deleted successfully",
      data: result.announcement,
    });
  }
);

const publishAnnouncement = catchAsync(
  async (req: Request, res: Response) => {
    const announcementId = req.params.id;
    const result = await announcementService.publishAnnouncement(announcementId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Announcement published successfully",
      data: result.announcement,
    });
  }
);

export const announcementController = {
  getAllAnnouncements,
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
};
