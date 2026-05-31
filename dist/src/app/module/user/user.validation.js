"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHRProfileSchema = exports.updateUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const enums_1 = require("../../../generated/prisma/enums");
exports.updateUserSchema = zod_1.default.object({
    email: zod_1.default.string().email().optional(),
    password: zod_1.default.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
    role: zod_1.default.nativeEnum(enums_1.UserRole).optional(),
    status: zod_1.default.nativeEnum(enums_1.UserStatus).optional(),
    is_deleted: zod_1.default.boolean().optional(),
    email_verified: zod_1.default.boolean().optional(),
});
exports.createHRProfileSchema = zod_1.default.object({
    user_id: zod_1.default.string().uuid("user_id must be a valid UUID"),
    employee_id: zod_1.default.string().uuid("employee_id must be a valid UUID"),
});
