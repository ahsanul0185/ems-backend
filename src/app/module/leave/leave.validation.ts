import z from "zod";
import { LeaveType } from "../../../generated/prisma/enums";

const parseDate = z.preprocess((value) => {
    if (typeof value === "string" || value instanceof Date) {
        return new Date(value);
    }
    return value;
}, z.date());

export const createLeaveZodSchema = z.object({
    title: z.string().min(1, "title is required"),
    start_date: parseDate,
    end_date: parseDate,
    total_days: z.number().int().nonnegative(),
    reason: z.string().min(1, "reason is required"),
    attachment_url: z.string().url().optional(),
    leave_type: z.nativeEnum(LeaveType),
    employee_id: z.string().uuid().optional(),
});

export const rejectLeaveZodSchema = z.object({
    rejection_reason: z.string().min(1, "rejection_reason is required"),
});
