"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const client_1 = require("../../../generated/prisma/client");
const bcrypt_1 = require("../../utils/bcrypt");
const createEmployee = async (payload) => {
    const { email, password, ...employeeData } = payload;
    const isUserExist = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (isUserExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User already exists with this email");
    }
    const hashedPassword = await bcrypt_1.bcryptUtils.hash(password);
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                role: client_1.UserRole.EMPLOYEE,
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
const updateEmployee = async (employeeId, payload) => {
    const existingEmployee = await prisma_1.prisma.employee.findUnique({
        where: {
            id: employeeId,
        },
    });
    if (!existingEmployee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Employee not found");
    }
    const employee = await prisma_1.prisma.employee.update({
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
    const employee = await prisma_1.prisma.employee.findUnique({
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
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Employee not found");
    }
    return {
        employee,
    };
};
const deleteEmployee = async (employeeId) => {
    const employee = await prisma_1.prisma.employee.findUnique({
        where: {
            id: employeeId,
        },
    });
    if (!employee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Employee not found");
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
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
                employment_status: client_1.EmployeeStatus.INACTIVE,
            },
        });
        return { updatedEmployee, updatedUser };
    });
    return {
        employee: result.updatedEmployee,
    };
};
const getAllEmployees = async (queryParams) => {
    const statusFilter = queryParams.employment_status
        ? { employment_status: queryParams.employment_status }
        : { employment_status: { not: client_1.EmployeeStatus.INACTIVE } };
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.employee, queryParams, {
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
    })
        .where(statusFilter) // <-- applies before search/filter/sort
        .search()
        .filter()
        .sort()
        .paginate();
    return builder.execute();
};
exports.employeeService = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    deleteEmployee,
    getAllEmployees,
};
