

import { Employee, HRProfile } from "../../../generated/prisma/client";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";


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
}

export interface IGetAllUsersResult {
    users: Partial<IUser>[];
}