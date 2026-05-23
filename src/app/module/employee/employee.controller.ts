import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { employeeService } from "./employee.service";
import { IEmployeeQueryParams } from "./employee.interface";



const createEmployee = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await employeeService.createEmployee(payload);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Employee created successfully",
            data: {
                employee: result.employee,
            }
        })
    }
)

const updateEmployee = catchAsync(
    async (req: Request, res: Response) => {
        const employeeId = req.params.id;
        const payload = req.body;
        const result = await employeeService.updateEmployee(employeeId as string, payload);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Employee updated successfully",
            data: {
                employee: result.employee,
            }
        })
    }
)

const getEmployeeById = catchAsync(
    async (req: Request, res: Response) => {
        const employeeId = req.params.id;
        const result = await employeeService.getEmployeeById(employeeId as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Employee retrieved successfully",
            data: {
                employee: result.employee,
            }
        })
    }
)

const deleteEmployee = catchAsync(
    async (req: Request, res: Response) => {
        const employeeId = req.params.id;
        const result = await employeeService.deleteEmployee(employeeId as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Employee deleted successfully",
            data: {
                employee: result.employee,
            }
        })
    }
)

const getAllEmployees = catchAsync(
    async (req: Request, res: Response) => {
        const queryParams = req.query as IEmployeeQueryParams;
        const result = await employeeService.getAllEmployees(queryParams);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Employees retrieved successfully",
            data: result.data,
            meta: result.meta,
        })
    }
)

export const employeeController = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    deleteEmployee,
    getAllEmployees,
};