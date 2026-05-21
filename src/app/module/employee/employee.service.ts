import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateEmployeePayload } from "./employee.interface";

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


export const employeeService = {
    createEmployee,
};