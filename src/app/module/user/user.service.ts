import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IGetAllUsersResult, IUpdateUserPayload, IUser } from "./user.interface";
import { EmployeeStatus, UserRole, UserStatus } from "../../../generated/prisma/enums";

const userSelectFields = {
    id: true,
    email: true,
    role: true,
    status: true,
    created_at: true,
    is_deleted: true,
    email_verified: true,
} as const;

const getAllUsers = async (): Promise<IGetAllUsersResult> => {
    const users = await prisma.user.findMany({
        where: { is_deleted: false },
        select: userSelectFields,
    });
    return { users };
};

const getUserById = async (userId: string): Promise<IUser> => {
    const user = await prisma.user.findUnique({
        where: { id: userId, is_deleted: false },
        select: {
            ...userSelectFields,
            employee: true,
            hr_profile: true,
        },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return user;
};

const updateUser = async (userId: string, payload: IUpdateUserPayload) => {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId, is_deleted: false },
    });

    if (!existingUser) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: payload,
        select: userSelectFields,
    });

    return { user };
};

const deleteUser = async (userId: string) => {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId, is_deleted: false },
        include: {
            employee: true,
            hr_profile: true,
        },
    });

    if (!existingUser) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    const user = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { is_deleted: true, status: UserStatus.DELETED },
            select: userSelectFields,
        });

        if (existingUser.role === UserRole.EMPLOYEE && existingUser.employee?.id) {
            await tx.employee.update({
                where: { id: existingUser.employee.id },
                data: { employment_status: EmployeeStatus.TERMINATED },
            });
        }

        return updatedUser;
    });

    return { user };
};

export const userService = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};