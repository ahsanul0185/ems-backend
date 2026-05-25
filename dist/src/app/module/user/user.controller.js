import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { userService } from "./user.service";
import status from "http-status";
const getAllUsers = catchAsync(async (req, res) => {
    const result = await userService.getAllUsers();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Users fetched successfully",
        data: result
    });
});
const getUserById = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const result = await userService.getUserById(userId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User data fetched successfully",
        data: result,
    });
});
const updateUser = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const payload = req.body;
    const result = await userService.updateUser(userId, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User updated successfully",
        data: result,
    });
});
const deleteUser = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const result = await userService.deleteUser(userId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User deleted successfully",
        data: result,
    });
});
const createHRProfile = catchAsync(async (req, res) => {
    const { user_id, employee_id } = req.body;
    const result = await userService.createHRProfile(user_id, employee_id);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "HR profile created successfully",
        data: result.hrProfile
    });
});
export const userController = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    createHRProfile,
};
