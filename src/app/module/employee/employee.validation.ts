import z from "zod";
import { EmployeeStatus, EmployeeType, Gender } from "../../../generated/prisma/enums";

const parseDate = z.preprocess((value) => {
    if (typeof value === "string" || value instanceof Date) {
        return new Date(value);
    }
    return value;
}, z.date());

export const createEmployeeZodSchema = z.object({
    user_id: z.string().uuid("user_id must be a valid UUID"),
    first_name: z.string().min(1, "first_name is required"),
    last_name: z.string().min(1, "last_name is required"),
    date_of_birth: parseDate,
    gender: z.nativeEnum(Gender).catch(() => Gender.MALE),
    blood_group: z.string().optional(),
    phone: z.string().min(7, "phone must be at least 7 characters"),
    emergency_contact_name: z.string().min(1, "emergency_contact_name is required"),
    emergency_contact_phone: z.string().min(7, "emergency_contact_phone must be at least 7 characters"),
    profile_url: z.string().url("profile_url must be a valid URL").optional(),
    department_id: z.string("department_id is required"),
    designation: z.string().min(1, "designation is required"),
    salary: z.number().int("salary must be an integer").nonnegative("salary must be a positive number"),
    bank_name: z.string().min(1, "bank_name is required"),
    bank_account_number: z.string().min(1, "bank_account_number is required"),
    employment_type: z.nativeEnum(EmployeeType),
    join_date: parseDate,
    employment_status: z.nativeEnum(EmployeeStatus).optional(),
    address_line1: z.string().min(1, "address_line1 is required"),
    address_line2: z.string().optional(),
    city: z.string().min(1, "city is required"),
    state: z.string().min(1, "state is required"),
    zip_code: z.string().min(1, "zip_code is required"),
    country: z.string().min(1, "country is required"),
    nid_number: z.string().optional(),
    tin_number: z.string().optional(),
    passport_number: z.string().optional(),
});

export const updateEmployeeZodSchema = createEmployeeZodSchema
    .omit({ user_id: true })
    .partial()
    .refine((payload) => Object.keys(payload).length > 0, {
        message: "At least one field must be provided for update",
    });
