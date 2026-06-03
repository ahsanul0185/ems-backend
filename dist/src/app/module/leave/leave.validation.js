"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectLeaveZodSchema = exports.createLeaveZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const enums_1 = require("../../../generated/prisma/enums");
const parseDate = zod_1.default.preprocess((value) => {
    if (typeof value === "string" || value instanceof Date) {
        return new Date(value);
    }
    return value;
}, zod_1.default.date());
exports.createLeaveZodSchema = zod_1.default.object({
    title: zod_1.default.string().min(1, "title is required"),
    start_date: parseDate,
    end_date: parseDate,
    total_days: zod_1.default.number().int().nonnegative(),
    reason: zod_1.default.string().min(1, "reason is required"),
    attachment_url: zod_1.default.string().url().optional(),
    leave_type: zod_1.default.nativeEnum(enums_1.LeaveType),
    employee_id: zod_1.default.string().uuid().optional(),
});
exports.rejectLeaveZodSchema = zod_1.default.object({
    rejection_reason: zod_1.default.string().min(1, "rejection_reason is required"),
});
