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
    // Employee profile fields
    first_name: zod_1.default.string().min(1).optional(),
    last_name: zod_1.default.string().min(1).optional(),
    date_of_birth: zod_1.default.string().datetime().or(zod_1.default.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    gender: zod_1.default.nativeEnum(enums_1.Gender).optional(),
    blood_group: zod_1.default.string().optional(),
    phone: zod_1.default.string().optional(),
    emergency_contact_name: zod_1.default.string().optional(),
    emergency_contact_phone: zod_1.default.string().optional(),
    profile_url: zod_1.default.string().optional(),
    department_id: zod_1.default.string().uuid().optional(),
    designation: zod_1.default.string().optional(),
    salary: zod_1.default.number().int().positive().optional(),
    bank_name: zod_1.default.string().optional(),
    bank_account_number: zod_1.default.string().optional(),
    employment_type: zod_1.default.nativeEnum(enums_1.EmployeeType).optional(),
    join_date: zod_1.default.string().datetime().or(zod_1.default.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    employment_status: zod_1.default.nativeEnum(enums_1.EmployeeStatus).optional(),
    address_line1: zod_1.default.string().optional(),
    address_line2: zod_1.default.string().optional(),
    city: zod_1.default.string().optional(),
    state: zod_1.default.string().optional(),
    zip_code: zod_1.default.string().optional(),
    country: zod_1.default.string().optional(),
    nid_number: zod_1.default.string().optional(),
    tin_number: zod_1.default.string().optional(),
    passport_number: zod_1.default.string().optional(),
});
exports.createHRProfileSchema = zod_1.default.object({
    user_id: zod_1.default.string().uuid("user_id must be a valid UUID"),
    employee_id: zod_1.default.string().uuid("employee_id must be a valid UUID"),
});
