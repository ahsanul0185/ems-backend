import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { employeeService } from "./employee.service";



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


export const employeeController = {
    createEmployee
};