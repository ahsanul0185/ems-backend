"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const enums_1 = require("../../../generated/prisma/enums");
const userSelectFields = {
    id: true,
    email: true,
    role: true,
    status: true,
    created_at: true,
    is_deleted: true,
    email_verified: true,
};
const getAllUsers = async (queryParams) => {
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.user, queryParams, {
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
    })
        .where({ is_deleted: false })
        .search()
        .filter()
        .sort()
        .paginate();
    return builder.execute();
};
const getUserById = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId, is_deleted: false },
        select: {
            ...userSelectFields,
            employee: true,
            hr_profile: true,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
};
const updateUser = async (userId, payload) => {
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { id: userId, is_deleted: false },
        include: { employee: true },
    });
    if (!existingUser) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const { email, role, status, first_name, last_name, date_of_birth, gender, blood_group, phone, emergency_contact_name, emergency_contact_phone, profile_url, department_id, designation, salary, bank_name, bank_account_number, employment_type, join_date, employment_status, address_line1, address_line2, city, state, zip_code, country, nid_number, tin_number, passport_number, ...rest } = payload;
    // Separate user-level fields from employee-level fields
    const userData = { email, role, status, ...rest };
    Object.keys(userData).forEach((key) => {
        if (userData[key] === undefined)
            delete userData[key];
    });
    const employeeData = {
        first_name, last_name, date_of_birth, gender, blood_group,
        phone, emergency_contact_name, emergency_contact_phone, profile_url,
        department_id, designation, salary, bank_name, bank_account_number,
        employment_type, join_date, employment_status,
        address_line1, address_line2, city, state, zip_code, country,
        nid_number, tin_number, passport_number,
    };
    Object.keys(employeeData).forEach((key) => {
        if (employeeData[key] === undefined)
            delete employeeData[key];
    });
    const hasEmployeeData = Object.keys(employeeData).length > 0;
    const result = await prisma_1.prisma.$transaction(async (tx) => {
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
const deleteUser = async (userId) => {
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { id: userId, is_deleted: false },
        include: {
            employee: true,
            hr_profile: true,
        },
    });
    if (!existingUser) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const user = await prisma_1.prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { is_deleted: true, status: enums_1.UserStatus.DELETED },
            select: userSelectFields,
        });
        if (existingUser.role === enums_1.UserRole.EMPLOYEE && existingUser.employee?.id) {
            await tx.employee.update({
                where: { id: existingUser.employee.id },
                data: { employment_status: enums_1.EmployeeStatus.TERMINATED },
            });
        }
        return updatedUser;
    });
    return { user };
};
const createHRProfile = async (user_id, employee_id) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: user_id } });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const employee = await prisma_1.prisma.employee.findUnique({ where: { id: employee_id } });
    if (!employee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Employee not found");
    }
    const existing = await prisma_1.prisma.hRProfile.findFirst({
        where: {
            OR: [
                { user_id },
                { employee_id }
            ]
        }
    });
    if (existing) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "HR profile already exists for the provided user or employee");
    }
    const [hrProfile] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.hRProfile.create({
            data: {
                user_id,
                employee_id,
            }
        }),
        prisma_1.prisma.user.update({
            where: { id: user_id },
            data: { role: enums_1.UserRole.HR }
        })
    ]);
    return { hrProfile };
};
exports.userService = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    createHRProfile,
};
