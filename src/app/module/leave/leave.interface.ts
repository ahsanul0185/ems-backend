import { IQueryParams } from "../../interfaces/query.interface";
import { LeaveType, LeaveRequestStatus } from "../../../generated/prisma/enums";

export interface ICreateLeavePayload {
    employee_id: string;
    title: string;
    start_date: Date;
    end_date: Date;
    total_days: number;
    reason: string;
    attachment_url?: string;
    leave_type: LeaveType;
}

export interface IRejectLeavePayload {
    approver_id: string;
    rejection_reason: string;
}

export type ICancelLeavePayload = {
    employee_id?: string;
}

export interface ILeaveQueryParams extends IQueryParams {
    status?: LeaveRequestStatus | string;
    leave_type?: LeaveType | string;
    employee_id?: string;
}

export type IApproveLeavePayload = {
    approver_id: string;
}
