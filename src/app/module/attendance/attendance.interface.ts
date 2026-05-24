import { AttendanceStatus } from "../../../generated/prisma/client";

export interface IClockInPayload {
    employee_id?: string; // Optional because for employee it comes from token, for HR it comes from body
    notes?: string;
}

export interface IClockOutPayload {
    employee_id?: string;
    notes?: string;
}

export interface IMarkInformedPayload {
    informed_reason: string;
}

export interface IUpdateAttendanceRecordPayload {
    clock_in_time?: string;
    clock_out_time?: string;
    status: AttendanceStatus;
    notes?: string;
}
