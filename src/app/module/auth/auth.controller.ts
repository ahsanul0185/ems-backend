import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";

import AppError from "../../errorHelpers/AppError";
import { tokenUtils } from "../../utils/token";

const createUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await authService.createUser(payload);

        const { user } = result;

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "User registered successfully",
            data: {
                user,
            }
        })
    }
)

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await authService.loginUser(payload);

        const { accessToken, refreshToken, user } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                user,
                accessToken,
                refreshToken
            },
        })
    }
)

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user.userId;

        const result = await authService.getMe(userId);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User profile fetched successfully",
            data: result,
        })
    }
)

const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
        }

        const result = await authService.getNewToken(refreshToken);

        const { accessToken, refreshToken: newRefreshToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New tokens generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken
            },
        });
    }
)

const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const userId = req.user.userId;

        await authService.changePassword(userId, payload);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password changed successfully",
            data: {},
        });
    }
)

const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await authService.logoutUser(refreshToken);
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: {},
        });
    }
)




export const authController = {
    createUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
};