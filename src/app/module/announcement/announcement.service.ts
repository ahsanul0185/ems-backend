import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryResult } from "../../interfaces/query.interface";
import { Announcement, AnnouncementStatus, AnnouncementAudience, UserRole } from "../../../generated/prisma/client";
import { ICreateAnnouncementPayload, IUpdateAnnouncementPayload, IAnnouncementQueryParams } from "./announcement.interface";

const createAnnouncement = async (payload: ICreateAnnouncementPayload, createdBy: string) => {
  const announcement = await prisma.announcement.create({
    data: {
      ...payload,
      created_by: createdBy,
    },
  });

  return { announcement };
};

const buildAudienceFilter = async (user: { role: UserRole; employeeId?: string }) => {
  if (user.role === UserRole.ADMIN) {
    return undefined;
  }

  const filters: Record<string, unknown>[] = [
    { audience: AnnouncementAudience.ALL },
  ];

  if (user.role === UserRole.HR) {
    filters.push({ audience: AnnouncementAudience.HR });
  } else {
    filters.push({ audience: AnnouncementAudience.EMPLOYEE });
  }

  if (user.employeeId) {
    const employee = await prisma.employee.findUnique({
      where: { id: user.employeeId },
      select: { department_id: true },
    });

    if (employee?.department_id) {
      filters.push({
        audience: AnnouncementAudience.DEPARTMENT,
        department_id: employee.department_id,
      });
    }
  }

  return { OR: filters };
};

const getAllAnnouncements = async (queryParams: IAnnouncementQueryParams, user: { role: UserRole; employeeId?: string }) : Promise<IQueryResult<Announcement>> => {
  const builder = new QueryBuilder<Announcement>(
    prisma.announcement,
    queryParams,
    {
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
    }
  )
    .search()
    .filter()
    .sort()
    .paginate();

  const audienceFilter = await buildAudienceFilter(user);
  if (audienceFilter) {
    builder.where(audienceFilter as any);
  }

  if (user.role !== UserRole.ADMIN) {
    builder.where({ status: AnnouncementStatus.PUBLISHED } as any);
  }

  return builder.execute();
};

const getAnnouncementById = async (announcementId: string) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    include: {
      creator: true,
      department: true,
    },
  });

  if (!announcement) {
    throw new AppError(status.NOT_FOUND, "Announcement not found");
  }

  return { announcement };
};

const updateAnnouncement = async (announcementId: string, payload: IUpdateAnnouncementPayload) => {
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });

  if (!announcement) {
    throw new AppError(status.NOT_FOUND, "Announcement not found");
  }

  const updated = await prisma.announcement.update({
    where: { id: announcementId },
    data: payload,
  });

  return { announcement: updated };
};

const deleteAnnouncement = async (announcementId: string) => {
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });

  if (!announcement) {
    throw new AppError(status.NOT_FOUND, "Announcement not found");
  }

  await prisma.announcement.delete({ where: { id: announcementId } });

  return { announcement };
};

const publishAnnouncement = async (announcementId: string) => {
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });

  if (!announcement) {
    throw new AppError(status.NOT_FOUND, "Announcement not found");
  }

  if (announcement.status === AnnouncementStatus.PUBLISHED) {
    throw new AppError(status.BAD_REQUEST, "Announcement is already published");
  }

  const updated = await prisma.announcement.update({
    where: { id: announcementId },
    data: {
      status: AnnouncementStatus.PUBLISHED,
      published_at: new Date(),
    },
  });

  return { announcement: updated };
};

export const announcementService = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
};
