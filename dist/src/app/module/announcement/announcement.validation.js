"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAnnouncementSchema = exports.createAnnouncementSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const enums_1 = require("../../../generated/prisma/enums");
const parseDate = zod_1.default.preprocess((value) => {
    if (typeof value === "string" || value instanceof Date) {
        return new Date(value);
    }
    return value;
}, zod_1.default.date());
const parseUUID = zod_1.default.string().uuid("must be a valid UUID");
exports.createAnnouncementSchema = zod_1.default.object({
    title: zod_1.default.string().min(1, "title is required"),
    content: zod_1.default.string().min(1, "content is required"),
    audience: zod_1.default.nativeEnum(enums_1.AnnouncementAudience),
    department_id: parseUUID.optional(),
    is_pinned: zod_1.default.boolean().optional(),
    attachment_url: zod_1.default.string().url("attachment_url must be a valid URL").optional(),
    expires_at: parseDate.optional(),
}).refine((data) => data.audience !== enums_1.AnnouncementAudience.DEPARTMENT || Boolean(data.department_id), {
    message: "department_id is required when audience is DEPARTMENT",
    path: ["department_id"],
});
exports.updateAnnouncementSchema = zod_1.default.object({
    title: zod_1.default.string().min(1).optional(),
    content: zod_1.default.string().min(1).optional(),
    audience: zod_1.default.nativeEnum(enums_1.AnnouncementAudience).optional(),
    department_id: parseUUID.optional(),
    is_pinned: zod_1.default.boolean().optional(),
    attachment_url: zod_1.default.string().url("attachment_url must be a valid URL").optional(),
    expires_at: parseDate.optional(),
    status: zod_1.default.nativeEnum(enums_1.AnnouncementStatus).optional(),
    published_at: parseDate.optional(),
})
    .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided for update",
});
