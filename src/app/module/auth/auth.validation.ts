import { z } from "zod";
import { UserRole } from "../../../generated/prisma/enums";

export const loginUserZodSchema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
});

export const createUserZodSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    role: z.enum(UserRole),
});

export const changePasswordZodSchema = z.object({
    oldPassword: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
});
