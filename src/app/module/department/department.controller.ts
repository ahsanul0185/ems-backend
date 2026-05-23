import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { departmentService } from "./department.service";
import status from "http-status";



const createDepartment = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await departmentService.createDepartment(payload);


        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Department created successfully",
            data: result
        })
    }
)



const getAllDepartments = catchAsync(
    async (req: Request, res: Response) => {
        const result = await departmentService.getAllDepartments();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Departments fetched successfully",
            data: result,
        });
    }
);



const updateDepartment = catchAsync(
    async (req: Request, res: Response) => {
        const departmentId = req.params.id;
        const payload = req.body;
        const result = await departmentService.updateDepartment(departmentId as string, payload);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Department updated successfully",
            data: result,
        });
    }
);

const deleteDepartment = catchAsync(
    async (req: Request, res: Response) => {
        const departmentId = req.params.id;
        const result = await departmentService.deleteDepartment(departmentId as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Department deleted successfully",
            data: result,
        });
    }
);


export const departmentController = {
    createDepartment,
    getAllDepartments,
    updateDepartment,
    deleteDepartment,
};