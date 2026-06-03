"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const user_service_1 = require("./user.service");
const http_status_1 = __importDefault(require("http-status"));
const getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await user_service_1.userService.getAllUsers(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Users fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getUserById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id;
    const result = await user_service_1.userService.getUserById(userId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User data fetched successfully",
        data: result,
    });
});
const updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id;
    const payload = req.body;
    const result = await user_service_1.userService.updateUser(userId, payload);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User updated successfully",
        data: result,
    });
});
const deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id;
    const result = await user_service_1.userService.deleteUser(userId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User deleted successfully",
        data: result,
    });
});
const createHRProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { user_id, employee_id } = req.body;
    const result = await user_service_1.userService.createHRProfile(user_id, employee_id);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.CREATED,
        success: true,
        message: "HR profile created successfully",
        data: result.hrProfile
    });
});
exports.userController = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    createHRProfile,
};
