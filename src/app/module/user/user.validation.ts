import z from "zod";
import { UserRole, UserStatus, Gender, EmployeeType, EmployeeStatus } from "../../../generated/prisma/enums";

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  is_deleted: z.boolean().optional(),
  email_verified: z.boolean().optional(),

  // Employee profile fields
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  date_of_birth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  gender: z.nativeEnum(Gender).optional(),
  blood_group: z.string().optional(),
  phone: z.string().regex(/^([01]|\+88)?\d{11}$/, { message: "Phone must be a valid 11-digit Bangladeshi mobile number" }).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  profile_url: z.string().optional(),
  department_id: z.string().uuid().optional(),
  designation: z.string().optional(),
  salary: z.number().int().positive().optional(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  employment_type: z.nativeEnum(EmployeeType).optional(),
  join_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  employment_status: z.nativeEnum(EmployeeStatus).optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  nid_number: z.string().optional(),
  tin_number: z.string().optional(),
  passport_number: z.string().optional(),
});

export const createHRProfileSchema = z.object({
  user_id: z.string().uuid("user_id must be a valid UUID"),
  employee_id: z.string().uuid("employee_id must be a valid UUID"),
});

