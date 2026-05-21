import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryResult } from "../../interfaces/query.interface";
import { ICreateEmployeePayload, IEmployeeQueryParams, IUpdateEmployeePayload } from "./employee.interface";
import { Employee } from "../../../generated/prisma/client";

const createEmployee = async (payload: ICreateEmployeePayload) => {
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
}

const updateEmployee = async (employeeId: string, payload: IUpdateEmployeePayload) => {
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
}

const getEmployeeById = async (employeeId: string) => {
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
}

const getAllEmployees = async (queryParams: IEmployeeQueryParams): Promise<IQueryResult<Employee>> => {
    const builder = new QueryBuilder<Employee>(
        prisma.employee,
        queryParams,
        {
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
        }
    )
        .search()
        .filter()
        .sort()
        .paginate();

    return builder.execute();
}

export const employeeService = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    getAllEmployees,
};