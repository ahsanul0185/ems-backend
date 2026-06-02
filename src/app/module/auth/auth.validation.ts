import { z } from "zod";
import { UserRole, Gender, EmployeeType, EmployeeStatus } from "../../../generated/prisma/enums";

export const loginUserZodSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
});

export const createUserZodSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    role: z.nativeEnum(UserRole),

    // Employee fields
    employee_code: z.string().min(1, "Employee code is required"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    date_of_birth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    gender: z.nativeEnum(Gender),
    blood_group: z.string().optional(),
    phone: z.string().min(1, "Phone is required"),
    emergency_contact_name: z.string().min(1, "Emergency contact name is required"),
    emergency_contact_phone: z.string().min(1, "Emergency contact phone is required"),
    profile_url: z.string().optional(),
    department_id: z.string().uuid("Department ID must be a valid UUID"),
    designation: z.string().min(1, "Designation is required"),
    salary: z.number().int().positive("Salary must be a positive number"),
    bank_name: z.string().min(1, "Bank name is required"),
    bank_account_number: z.string().min(1, "Bank account number is required"),
    employment_type: z.nativeEnum(EmployeeType),
    join_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    employment_status: z.nativeEnum(EmployeeStatus).optional(),
    address_line1: z.string().min(1, "Address is required"),
    address_line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip_code: z.string().min(1, "ZIP code is required"),
    country: z.string().min(1, "Country is required"),
    nid_number: z.string().optional(),
    tin_number: z.string().optional(),
    passport_number: z.string().optional(),
});

export const changePasswordZodSchema = z.object({
    oldPassword: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
});
