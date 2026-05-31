"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeZodSchema = exports.createEmployeeZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const enums_1 = require("../../../generated/prisma/enums");
const parseDate = zod_1.default.preprocess((value) => {
    if (typeof value === "string" || value instanceof Date) {
        return new Date(value);
    }
    return value;
}, zod_1.default.date());
exports.createEmployeeZodSchema = zod_1.default.object({
    // Auth credentials (used to create the user account)
    email: zod_1.default.string().email("email must be a valid email address"),
    password: zod_1.default.string().min(8, "password must be at least 8 characters"),
    // Employee profile fields (no user_id — it's generated internally)
    first_name: zod_1.default.string().min(1, "first_name is required"),
    last_name: zod_1.default.string().min(1, "last_name is required"),
    date_of_birth: parseDate,
    gender: zod_1.default.nativeEnum(enums_1.Gender).catch(() => enums_1.Gender.MALE),
    blood_group: zod_1.default.string().optional(),
    phone: zod_1.default.string().min(7, "phone must be at least 7 characters"),
    emergency_contact_name: zod_1.default.string().min(1, "emergency_contact_name is required"),
    emergency_contact_phone: zod_1.default.string().min(7, "emergency_contact_phone must be at least 7 characters"),
    profile_url: zod_1.default.string().url("profile_url must be a valid URL").optional(),
    department_id: zod_1.default.string().min(1, "department_id is required"),
    designation: zod_1.default.string().min(1, "designation is required"),
    salary: zod_1.default.number().int("salary must be an integer").nonnegative("salary must be a positive number"),
    bank_name: zod_1.default.string().min(1, "bank_name is required"),
    bank_account_number: zod_1.default.string().min(1, "bank_account_number is required"),
    employment_type: zod_1.default.nativeEnum(enums_1.EmployeeType),
    join_date: parseDate,
    employment_status: zod_1.default.nativeEnum(enums_1.EmployeeStatus).optional(),
    address_line1: zod_1.default.string().min(1, "address_line1 is required"),
    address_line2: zod_1.default.string().optional(),
    city: zod_1.default.string().min(1, "city is required"),
    state: zod_1.default.string().min(1, "state is required"),
    zip_code: zod_1.default.string().min(1, "zip_code is required"),
    country: zod_1.default.string().min(1, "country is required"),
    nid_number: zod_1.default.string().optional(),
    tin_number: zod_1.default.string().optional(),
    passport_number: zod_1.default.string().optional(),
});
exports.updateEmployeeZodSchema = exports.createEmployeeZodSchema
    .omit({ email: true, password: true })
    .partial()
    .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided for update",
});
