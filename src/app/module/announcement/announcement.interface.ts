import { IQueryParams } from "../../interfaces/query.interface";
import { AnnouncementAudience, AnnouncementStatus } from "../../../generated/prisma/enums";

export interface ICreateAnnouncementPayload {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  department_id?: string;
  is_pinned?: boolean;
  attachment_url?: string;
  expires_at?: Date;
}

export interface IUpdateAnnouncementPayload extends Partial<ICreateAnnouncementPayload> {
  status?: AnnouncementStatus;
  published_at?: Date;
}

export interface IAnnouncementQueryParams extends IQueryParams {
  status?: AnnouncementStatus | string;
  audience?: AnnouncementAudience | string;
  department_id?: string;
  created_by?: string;
}
