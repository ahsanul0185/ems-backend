import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { EmployeeStatus } from "../../../generated/prisma/client";
const createEmployee = async (payload) => {
    const { user_id } = payload;
    const employee_code = "EMP-" + user_id.slice(-6).toUpperCase();
    const existingEmployee = await prisma.employee.findFirst({
        where: {
            OR: [
                { user_id },
                { employee_code }
            ]
        }
    });
    if (existingEmployee) {
        throw new AppError(status.BAD_REQUEST, "Employee already exists for this user or employee code");
    }
    const employee = await prisma.employee.create({
        data: {
            ...payload,
            employee_code,
        },
    });
    return {
        employee,
    };
};
const updateEmployee = async (employeeId, payload) => {
    const existingEmployee = await prisma.employee.findUnique({
        where: {
            id: employeeId,
        },
    });
    if (!existingEmployee) {
        throw new AppError(status.NOT_FOUND, "Employee not found");
    }
    const employee = await prisma.employee.update({
        where: {
            id: employeeId,
        },
        data: payload,
    });
    return {
        employee,
    };
};
const getEmployeeById = async (employeeId) => {
    const employee = await prisma.employee.findUnique({
        where: {
            id: employeeId,
        },
        include: {
            user: true,
            department: true,
            attendance: true,
            payslips: true,
            leave_requests: true,
        },
    });
    if (!employee) {
        throw new AppError(status.NOT_FOUND, "Employee not found");
    }
    return {
        employee,
    };
};
const deleteEmployee = async (employeeId) => {
    const employee = await prisma.employee.findUnique({
        where: {
            id: employeeId,
        },
    });
    if (!employee) {
        throw new AppError(status.NOT_FOUND, "Employee not found");
    }
    const result = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: {
                id: employee.user_id,
            },
            data: {
                is_deleted: true,
            },
        });
        const updatedEmployee = await tx.employee.update({
            where: {
                id: employeeId,
            },
            data: {
                employment_status: EmployeeStatus.INACTIVE,
            },
        });
        return { updatedEmployee, updatedUser };
    });
    return {
        employee: result.updatedEmployee,
    };
};
const getAllEmployees = async (queryParams) => {
    const builder = new QueryBuilder(prisma.employee, queryParams, {
        searchableFields: [
            "first_name",
            "last_name",
            "phone",
            "department.name",
            "user.email",
        ],
        filterableFields: [
            "department_id",
            "employment_status",
            "employment_type",
            "designation",
            "city",
            "state",
            "country",
            "gender",
        ],
        defaultSelect: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
            designation: true,
            employment_status: true,
            gender: true,
            employment_type: true,
            department: {
                select: {
                    name: true,
                }
            },
            user: {
                select: {
                    email: true,
                }
            }
        }
    })
        .search()
        .filter()
        .sort()
        .paginate();
    return builder.execute();
};
export const employeeService = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    deleteEmployee,
    getAllEmployees,
};
