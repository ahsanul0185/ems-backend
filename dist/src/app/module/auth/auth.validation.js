"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordZodSchema = exports.createUserZodSchema = exports.loginUserZodSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../../generated/prisma/enums");
exports.loginUserZodSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
});
exports.createUserZodSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    role: zod_1.z.enum(enums_1.UserRole),
});
exports.changePasswordZodSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    newPassword: zod_1.z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
});
