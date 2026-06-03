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
    role: zod_1.z.nativeEnum(enums_1.UserRole),
    // Employee fields
    employee_code: zod_1.z.string().min(1, "Employee code is required"),
    first_name: zod_1.z.string().min(1, "First name is required"),
    last_name: zod_1.z.string().min(1, "Last name is required"),
    date_of_birth: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    gender: zod_1.z.nativeEnum(enums_1.Gender),
    blood_group: zod_1.z.string().optional(),
    phone: zod_1.z.string().min(1, "Phone is required"),
    emergency_contact_name: zod_1.z.string().min(1, "Emergency contact name is required"),
    emergency_contact_phone: zod_1.z.string().min(1, "Emergency contact phone is required"),
    profile_url: zod_1.z.string().optional(),
    department_id: zod_1.z.string().uuid("Department ID must be a valid UUID"),
    designation: zod_1.z.string().min(1, "Designation is required"),
    salary: zod_1.z.number().int().positive("Salary must be a positive number"),
    bank_name: zod_1.z.string().min(1, "Bank name is required"),
    bank_account_number: zod_1.z.string().min(1, "Bank account number is required"),
    employment_type: zod_1.z.nativeEnum(enums_1.EmployeeType),
    join_date: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    employment_status: zod_1.z.nativeEnum(enums_1.EmployeeStatus).optional(),
    address_line1: zod_1.z.string().min(1, "Address is required"),
    address_line2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, "City is required"),
    state: zod_1.z.string().min(1, "State is required"),
    zip_code: zod_1.z.string().min(1, "ZIP code is required"),
    country: zod_1.z.string().min(1, "Country is required"),
    nid_number: zod_1.z.string().optional(),
    tin_number: zod_1.z.string().optional(),
    passport_number: zod_1.z.string().optional(),
});
exports.changePasswordZodSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    newPassword: zod_1.z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
});
