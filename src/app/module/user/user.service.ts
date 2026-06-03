import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryResult } from "../../interfaces/query.interface";
import { IUserQueryParams, IUpdateUserPayload, IUser } from "./user.interface";
import { EmployeeStatus, UserRole, UserStatus } from "../../../generated/prisma/enums";
import { User } from "../../../generated/prisma/client";

const userSelectFields = {
    id: true,
    email: true,
    role: true,
    status: true,
    created_at: true,
    is_deleted: true,
    email_verified: true,
} as const;

const getAllUsers = async (queryParams: IUserQueryParams): Promise<IQueryResult<User>> => {
    const builder = new QueryBuilder<User>(
        prisma.user,
        queryParams,
        {
            searchableFields: [
                "email",
                "employee.first_name",
                "employee.last_name",
                "employee.phone",
            ],
            filterableFields: [
                "role",
                "status",
            ],
            defaultSelect: {
                id: true,
                email: true,
                role: true,
                status: true,
                created_at: true,
                is_deleted: true,
                email_verified: true,
                employee: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        phone: true,
                        designation: true,
                        employment_status: true,
                    }
                }
            }
        }
    )
        .where({ is_deleted: false })
        .search()
        .filter()
        .sort()
        .paginate();

    return builder.execute();
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
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
};

const updateUser = async (userId: string, payload: IUpdateUserPayload) => {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId, is_deleted: false },
        include: { employee: true },
    });

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const {
        email, role, status,
        first_name, last_name, date_of_birth, gender, blood_group,
        phone, emergency_contact_name, emergency_contact_phone, profile_url,
        department_id, designation, salary, bank_name, bank_account_number,
        employment_type, join_date, employment_status,
        address_line1, address_line2, city, state, zip_code, country,
        nid_number, tin_number, passport_number,
        ...rest
    } = payload;

    // Separate user-level fields from employee-level fields
    const userData: Record<string, unknown> = { email, role, status, ...rest };
    Object.keys(userData).forEach((key) => {
        if (userData[key] === undefined) delete userData[key];
    });

    const employeeData: Record<string, unknown> = {
        first_name, last_name,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
        gender, blood_group,
        phone, emergency_contact_name, emergency_contact_phone, profile_url,
        department_id, designation, salary, bank_name, bank_account_number,
        employment_type,
        join_date: join_date ? new Date(join_date) : undefined,
        employment_status,
        address_line1, address_line2, city, state, zip_code, country,
        nid_number, tin_number, passport_number,
    };
    Object.keys(employeeData).forEach((key) => {
        if (employeeData[key] === undefined) delete employeeData[key];
    });

    const hasEmployeeData = Object.keys(employeeData).length > 0;

    const result = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: userData,
            select: userSelectFields,
        });

        if (hasEmployeeData && existingUser.employee) {
            await tx.employee.update({
                where: { id: existingUser.employee.id },
                data: employeeData,
            });
        }

        return { user: updatedUser };
    });

    return result;
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
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
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
const createHRProfile = async (user_id: string, employee_id: string) => {
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const employee = await prisma.employee.findUnique({ where: { id: employee_id } });
    if (!employee) {
        throw new AppError(httpStatus.NOT_FOUND, "Employee not found");
    }

    const existing = await prisma.hRProfile.findFirst({
        where: {
            OR: [
                { user_id },
                { employee_id }
            ]
        }
    });

    if (existing) {
        throw new AppError(httpStatus.BAD_REQUEST, "HR profile already exists for the provided user or employee");
    }

    const [hrProfile] = await prisma.$transaction([
        prisma.hRProfile.create({
            data: {
                user_id,
                employee_id,
            }
        }),
        prisma.user.update({
            where: { id: user_id },
            data: { role: UserRole.HR }
        })
    ]);

    return { hrProfile };
};

export const userService = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    createHRProfile,
};