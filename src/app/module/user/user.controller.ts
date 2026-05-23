import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { userService } from "./user.service";
import status from "http-status";



const getAllUsers = catchAsync(
    async (req: Request, res: Response) => {
        const result = await userService.getAllUsers();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Users fetched successfully",
            data: result
        })
    }
)



const getUserById = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.params.id;
        const result = await userService.getUserById(userId as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User data fetched successfully",
            data: result,
        });
    }
);



const updateUser = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.params.id;
        const payload = req.body;
        const result = await userService.updateUser(userId as string, payload);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User updated successfully",
            data: result,
        });
    }
);

const deleteUser = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.params.id;
        const result = await userService.deleteUser(userId as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User deleted successfully",
            data: result,
        });
    }
);





export const userController = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};