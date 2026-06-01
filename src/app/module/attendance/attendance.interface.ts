import { AttendanceStatus } from "../../../generated/prisma/client";

export interface IClockInPayload {
    employee_id?: string; // Optional — from token for employee, from body for HR
    notes?: string;
    date?: string; // "YYYY-MM-DD" — used by HR for backdated clock-in
    time?: string; // ISO datetime string — used by HR for custom clock-in time
}

export interface IClockOutPayload {
    employee_id?: string;
    notes?: string;
    date?: string; // "YYYY-MM-DD" — used by HR for backdated clock-out
    time?: string; // ISO datetime string — used by HR for custom clock-out time
}

export interface IMarkInformedPayload {
    informed_reason: string;
}

export interface IUpdateAttendanceRecordPayload {
    clock_in_time?: string;  // ISO datetime string
    clock_out_time?: string; // ISO datetime string
    status: AttendanceStatus;
    notes?: string;
}
