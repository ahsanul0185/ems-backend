import z from "zod";
import { AnnouncementAudience, AnnouncementStatus } from "../../../generated/prisma/enums";
const parseDate = z.preprocess((value) => {
    if (typeof value === "string" || value instanceof Date) {
        return new Date(value);
    }
    return value;
}, z.date());
const parseUUID = z.string().uuid("must be a valid UUID");
export const createAnnouncementSchema = z.object({
    title: z.string().min(1, "title is required"),
    content: z.string().min(1, "content is required"),
    audience: z.nativeEnum(AnnouncementAudience),
    department_id: parseUUID.optional(),
    is_pinned: z.boolean().optional(),
    attachment_url: z.string().url("attachment_url must be a valid URL").optional(),
    expires_at: parseDate.optional(),
}).refine((data) => data.audience !== AnnouncementAudience.DEPARTMENT || Boolean(data.department_id), {
    message: "department_id is required when audience is DEPARTMENT",
    path: ["department_id"],
});
export const updateAnnouncementSchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    audience: z.nativeEnum(AnnouncementAudience).optional(),
    department_id: parseUUID.optional(),
    is_pinned: z.boolean().optional(),
    attachment_url: z.string().url("attachment_url must be a valid URL").optional(),
    expires_at: parseDate.optional(),
    status: z.nativeEnum(AnnouncementStatus).optional(),
    published_at: parseDate.optional(),
})
    .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided for update",
});
