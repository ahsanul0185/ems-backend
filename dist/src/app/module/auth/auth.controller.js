"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const auth_service_1 = require("./auth.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const token_1 = require("../../utils/token");
const createUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await auth_service_1.authService.createUser(payload);
    const { user } = result;
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.CREATED,
        success: true,
        message: "User registered successfully",
        data: {
            user,
        }
    });
});
const loginUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await auth_service_1.authService.loginUser(payload);
    const { accessToken, refreshToken, user } = result;
    token_1.tokenUtils.setAccessTokenCookie(res, accessToken);
    token_1.tokenUtils.setRefreshTokenCookie(res, refreshToken);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            user,
            accessToken,
            refreshToken
        },
    });
});
const getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const result = await auth_service_1.authService.getMe(userId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User profile fetched successfully",
        data: result,
    });
});
const getMyProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const result = await auth_service_1.authService.getMyProfile(userId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User profile fetched successfully",
        data: result,
    });
});
const getNewToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await auth_service_1.authService.getNewToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = result;
    token_1.tokenUtils.setAccessTokenCookie(res, accessToken);
    token_1.tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "New tokens generated successfully",
        data: {
            accessToken,
            refreshToken: newRefreshToken
        },
    });
});
const changePassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const userId = req.user.userId;
    await auth_service_1.authService.changePassword(userId, payload);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Password changed successfully",
        data: {},
    });
});
const logoutUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await auth_service_1.authService.logoutUser(refreshToken);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User logged out successfully",
        data: {},
    });
});
exports.authController = {
    createUser,
    loginUser,
    getMe,
    getMyProfile,
    getNewToken,
    changePassword,
    logoutUser,
};
