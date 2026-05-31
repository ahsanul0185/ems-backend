"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const bcrypt_1 = require("../../utils/bcrypt");
const jwt_1 = require("../../utils/jwt");
const token_1 = require("../../utils/token");
const env_1 = require("../../config/env");
const enums_1 = require("../../../generated/prisma/enums");
const createUser = async (payload) => {
    const { email, password, role } = payload;
    const isUserExist = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (isUserExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User already exists with this email");
    }
    const hashedPassword = await bcrypt_1.bcryptUtils.hash(password);
    const user = await prisma_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role,
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
    };
};
const loginUser = async (payload) => {
    const { email, password } = payload;
    const user = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (user.is_deleted || user.status === enums_1.UserStatus.INACTIVE) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "User account is inactive or deleted");
    }
    const isPasswordMatched = await bcrypt_1.bcryptUtils.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid password");
    }
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const accessToken = token_1.tokenUtils.getAccessToken(jwtPayload);
    const refreshToken = token_1.tokenUtils.getRefreshToken(jwtPayload);
    const hashedRefreshToken = await bcrypt_1.bcryptUtils.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma_1.prisma.session.create({
        data: {
            user_id: user.id,
            refresh_token: hashedRefreshToken,
            expires_at: expiresAt,
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};
const getNewToken = async (refreshToken) => {
    const verifiedRefreshToken = jwt_1.jwtUtils.verifyToken(refreshToken, env_1.env.REFRESH_TOKEN_SECRET);
    if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid refresh token");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { userId } = verifiedRefreshToken.data;
    const userSessions = await prisma_1.prisma.session.findMany({
        where: { user_id: userId }
    });
    let matchedSession = null;
    for (const session of userSessions) {
        if (await bcrypt_1.bcryptUtils.compare(refreshToken, session.refresh_token)) {
            matchedSession = session;
            break;
        }
    }
    if (!matchedSession) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Session not found");
    }
    if (matchedSession.expires_at < new Date()) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Session expired");
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.is_deleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const newAccessToken = token_1.tokenUtils.getAccessToken(jwtPayload);
    const newRefreshToken = token_1.tokenUtils.getRefreshToken(jwtPayload);
    const newHashedRefreshToken = await bcrypt_1.bcryptUtils.hash(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma_1.prisma.session.update({
        where: { id: matchedSession.id },
        data: {
            refresh_token: newHashedRefreshToken,
            expires_at: newExpiresAt,
        }
    });
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};
const getMe = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
const getMyProfile = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            email_verified: true,
            created_at: true,
            updated_at: true,
            employee: {
                include: {
                    department: true,
                    hr_profile: true,
                }
            }
        }
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
};
const changePassword = async (userId, payload) => {
    const { oldPassword, newPassword } = payload;
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const isPasswordMatched = await bcrypt_1.bcryptUtils.compare(oldPassword, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid old password");
    }
    const hashedNewPassword = await bcrypt_1.bcryptUtils.hash(newPassword);
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });
    await prisma_1.prisma.session.deleteMany({ where: { user_id: userId } });
    return null;
};
const logoutUser = async (refreshToken) => {
    if (!refreshToken)
        return;
    try {
        const verifiedToken = jwt_1.jwtUtils.verifyToken(refreshToken, env_1.env.REFRESH_TOKEN_SECRET);
        if (!verifiedToken.success)
            return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { userId } = verifiedToken.data;
        const userSessions = await prisma_1.prisma.session.findMany({ where: { user_id: userId } });
        for (const session of userSessions) {
            if (await bcrypt_1.bcryptUtils.compare(refreshToken, session.refresh_token)) {
                await prisma_1.prisma.session.delete({ where: { id: session.id } });
                break;
            }
        }
    }
    catch (error) {
        // ignore errors during logout token parsing
    }
};
exports.authService = {
    createUser,
    loginUser,
    getMe,
    getMyProfile,
    getNewToken,
    changePassword,
    logoutUser,
};
