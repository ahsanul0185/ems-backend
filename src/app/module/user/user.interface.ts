import { Employee, HRProfile } from "../../../generated/prisma/client";
import { UserRole, UserStatus, Gender, EmployeeType, EmployeeStatus } from "../../../generated/prisma/enums";

export interface IUser {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    is_deleted: boolean;
    email_verified: boolean;
    created_at: Date;
    updated_at?: Date;
    employee?: Employee | null;
    hr_profile?: HRProfile | null;
}

export interface IUpdateUserPayload {
    email?: string;
    role?: UserRole;
    status?: UserStatus;

    // Employee profile fields (for admin editing)
    first_name?: string;
    last_name?: string;
    date_of_birth?: Date;
    gender?: Gender;
    blood_group?: string;
    phone?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    profile_url?: string;
    department_id?: string;
    designation?: string;
    salary?: number;
    bank_name?: string;
    bank_account_number?: string;
    employment_type?: EmployeeType;
    join_date?: Date;
    employment_status?: EmployeeStatus;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    nid_number?: string;
    tin_number?: string;
    passport_number?: string;
}

export interface IUserQueryParams {
    searchTerm?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    role?: UserRole;
    status?: UserStatus;
    [key: string]: string | undefined;
}