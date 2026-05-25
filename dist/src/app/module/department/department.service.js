import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
const getAllDepartments = async () => {
    const departments = await prisma.department.findMany();
    return {
        departments,
    };
};
const createDepartment = async (payload) => {
    const existingDepartment = await prisma.department.findFirst({
        where: {
            name: payload.name,
        }
    });
    if (existingDepartment) {
        throw new AppError(status.BAD_REQUEST, "Department already exists with this name");
    }
    const department = await prisma.department.create({
        data: {
            ...payload,
        },
    });
    return {
        department,
    };
};
const updateDepartment = async (departmentId, payload) => {
    const existingDepartment = await prisma.department.findUnique({
        where: {
            id: departmentId,
        }
    });
    if (!existingDepartment) {
        throw new AppError(status.NOT_FOUND, "Department not found");
    }
    const department = await prisma.department.update({
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
        const department = await prisma.department.delete({
            where: { id: departmentId },
        });
        return { department };
    }
    catch (error) {
        throw new AppError(status.NOT_FOUND, "Department not found");
    }
};
export const departmentService = {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getAllDepartments,
};
