import { EmployeeStatus, EmployeeType, Gender } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";

export interface ICreateEmployeePayload {
    email: string;
    password: string;

    employee_code: string;
    first_name: string;
    last_name: string;
    date_of_birth: string; // ISO date string YYYY-MM-DD
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
    join_date: string; // ISO date string YYYY-MM-DD
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

export type IUpdateEmployeePayload = Partial<Omit<ICreateEmployeePayload, "email" | "password">>;

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