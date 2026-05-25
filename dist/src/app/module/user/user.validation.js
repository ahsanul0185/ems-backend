import z from "zod";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
export const updateUserSchema = z.object({
    email: z.string().email().optional(),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    is_deleted: z.boolean().optional(),
    email_verified: z.boolean().optional(),
});
export const createHRProfileSchema = z.object({
    user_id: z.string().uuid("user_id must be a valid UUID"),
    employee_id: z.string().uuid("employee_id must be a valid UUID"),
});
