import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryResult } from "../../interfaces/query.interface";
import { ICreateEmployeePayload, IEmployeeQueryParams, IUpdateEmployeePayload } from "./employee.interface";
import { Employee, EmployeeStatus, UserRole } from "../../../generated/prisma/client";
import { bcryptUtils } from "../../utils/bcrypt";


const createEmployee = async (payload: ICreateEmployeePayload) => {
    const { email, password, ...employeeData } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (isUserExist) {
        throw new AppError(status.BAD_REQUEST, "User already exists with this email");
    }

    const hashedPassword = await bcryptUtils.hash(password);

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                role: UserRole.EMPLOYEE,
            },
        });

        const employee_code = "EMP-" + user.id.slice(-6).toUpperCase();

        const employee = await tx.employee.create({
            data: {
                ...employeeData,
                user_id: user.id,
                employee_code,
            },
        });

        return { employee };
    });

    return { employee: result.employee };
};

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

const deleteEmployee = async (employeeId: string) => {
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
}

const getAllEmployees = async (queryParams: IEmployeeQueryParams): Promise<IQueryResult<Employee>> => {
    const statusFilter = queryParams.employment_status
        ? { employment_status: queryParams.employment_status as EmployeeStatus }
        : { employment_status: { not: EmployeeStatus.INACTIVE } };

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
                "employment_type",
                "designation",
                "city",
                "state",
                "country",
                "gender",
                // employment_status removed — handled manually via .where()
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
                    select: { name: true }
                },
                user: {
                    select: { email: true }
                }
            }
        }
    )
        .where(statusFilter)  // <-- applies before search/filter/sort
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