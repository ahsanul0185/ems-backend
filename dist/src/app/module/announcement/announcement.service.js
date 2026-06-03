"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const client_1 = require("../../../generated/prisma/client");
const createAnnouncement = async (payload, createdBy) => {
    const announcement = await prisma_1.prisma.announcement.create({
        data: {
            ...payload,
            published_at: payload.status === client_1.AnnouncementStatus.PUBLISHED ? new Date() : null,
            created_by: createdBy,
        },
    });
    return { announcement };
};
const buildAudienceFilter = async (user) => {
    if (user.role === client_1.UserRole.ADMIN) {
        return undefined;
    }
    const filters = [
        { audience: client_1.AnnouncementAudience.ALL },
    ];
    if (user.role === client_1.UserRole.HR) {
        filters.push({ audience: client_1.AnnouncementAudience.HR });
    }
    else {
        filters.push({ audience: client_1.AnnouncementAudience.EMPLOYEE });
    }
    if (user.employeeId) {
        const employee = await prisma_1.prisma.employee.findUnique({
            where: { id: user.employeeId },
            select: { department_id: true },
        });
        if (employee?.department_id) {
            filters.push({
                audience: client_1.AnnouncementAudience.DEPARTMENT,
                department_id: employee.department_id,
            });
        }
    }
    return { OR: filters };
};
const getAllAnnouncements = async (queryParams, user) => {
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.announcement, queryParams, {
        searchableFields: ["title", "content"],
        filterableFields: ["status", "audience", "department_id", "created_by"],
        defaultSelect: {
            id: true,
            title: true,
            content: true,
            audience: true,
            department_id: true,
            status: true,
            is_pinned: true,
            attachment_url: true,
            published_at: true,
            expires_at: true,
            created_at: true,
            creator: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                }
            },
            department: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    })
        .search()
        .filter()
        .sort()
        .paginate();
    // const audienceFilter = await buildAudienceFilter(user);
    // if (audienceFilter) {
    //   builder.where(audienceFilter as any);
    // }
    // if (user.role !== UserRole.ADMIN) {
    //   builder.where({ status: AnnouncementStatus.PUBLISHED } as any);
    // }
    return builder.execute();
};
const getAnnouncementById = async (announcementId) => {
    const announcement = await prisma_1.prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
            creator: true,
            department: true,
        },
    });
    if (!announcement) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Announcement not found");
    }
    return { announcement };
};
const updateAnnouncement = async (announcementId, payload) => {
    const announcement = await prisma_1.prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!announcement) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Announcement not found");
    }
    const updated = await prisma_1.prisma.announcement.update({
        where: { id: announcementId },
        data: payload,
    });
    return { announcement: updated };
};
const deleteAnnouncement = async (announcementId) => {
    const announcement = await prisma_1.prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!announcement) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Announcement not found");
    }
    await prisma_1.prisma.announcement.delete({ where: { id: announcementId } });
    return { announcement };
};
const publishAnnouncement = async (announcementId) => {
    const announcement = await prisma_1.prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!announcement) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Announcement not found");
    }
    if (announcement.status === client_1.AnnouncementStatus.PUBLISHED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Announcement is already published");
    }
    const updated = await prisma_1.prisma.announcement.update({
        where: { id: announcementId },
        data: {
            status: client_1.AnnouncementStatus.PUBLISHED,
            published_at: new Date(),
        },
    });
    return { announcement: updated };
};
exports.announcementService = {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
};
