


import { EmployeeStatus, EmployeeType, Gender } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";

export interface ICreateEmployeePayload {
    user_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: Date;
    gender: Gender;
    blood_group?: string;
    phone: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    profile_url?: string;
    department_id: string;
    designation: string;
    salary: number;
    bank_name: string;
    bank_account_number: string;
    employment_type: EmployeeType;
    join_date: Date;
    employment_status?: EmployeeStatus;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    nid_number?: string;
    tin_number?: string;
    passport_number?: string;
}

export interface IEmployeeQueryParams extends IQueryParams {
    department_id?: string;
    employment_status?: string;
    employment_type?: string;
    designation?: string;
    city?: string;
    state?: string;
    country?: string;
    gender?: string;
}

