"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const getAllDepartments = async () => {
    const departments = await prisma_1.prisma.department.findMany();
    return {
        departments,
    };
};
const createDepartment = async (payload) => {
    const existingDepartment = await prisma_1.prisma.department.findFirst({
        where: {
            name: payload.name,
        }
    });
    if (existingDepartment) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Department already exists with this name");
    }
    const department = await prisma_1.prisma.department.create({
        data: {
            ...payload,
        },
    });
    return {
        department,
    };
};
const updateDepartment = async (departmentId, payload) => {
    const existingDepartment = await prisma_1.prisma.department.findUnique({
        where: {
            id: departmentId,
        }
    });
    if (!existingDepartment) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Department not found");
    }
    const department = await prisma_1.prisma.department.update({
        where: {
            id: departmentId,
        },
        data: payload,
    });
    return {
        department,
    };
};
const deleteDepartment = async (departmentId) => {
    try {
        const department = await prisma_1.prisma.department.delete({
            where: { id: departmentId },
        });
        return { department };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Department not found");
    }
};
exports.departmentService = {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getAllDepartments,
};
