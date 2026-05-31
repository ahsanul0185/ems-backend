"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
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
const getAllUsers = async () => {
    const users = await prisma_1.prisma.user.findMany({
        where: { is_deleted: false },
        select: userSelectFields,
    });
    return { users };
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
    });
    if (!existingUser) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const user = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: payload,
        select: userSelectFields,
    });
    return { user };
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
