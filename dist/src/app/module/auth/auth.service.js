import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { bcryptUtils } from "../../utils/bcrypt";
import { jwtUtils } from "../../utils/jwt";
import { tokenUtils } from "../../utils/token";
import { env } from "../../config/env";
import { UserStatus } from "../../../generated/prisma/enums";
const createUser = async (payload) => {
    const { email, password, role } = payload;
    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });
    if (isUserExist) {
        throw new AppError(status.BAD_REQUEST, "User already exists with this email");
    }
    const hashedPassword = await bcryptUtils.hash(password);
    const user = await prisma.user.create({
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
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    if (user.is_deleted || user.status === UserStatus.INACTIVE) {
        throw new AppError(status.FORBIDDEN, "User account is inactive or deleted");
    }
    const isPasswordMatched = await bcryptUtils.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new AppError(status.UNAUTHORIZED, "Invalid password");
    }
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const accessToken = tokenUtils.getAccessToken(jwtPayload);
    const refreshToken = tokenUtils.getRefreshToken(jwtPayload);
    const hashedRefreshToken = await bcryptUtils.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
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
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);
    if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { userId } = verifiedRefreshToken.data;
    const userSessions = await prisma.session.findMany({
        where: { user_id: userId }
    });
    let matchedSession = null;
    for (const session of userSessions) {
        if (await bcryptUtils.compare(refreshToken, session.refresh_token)) {
            matchedSession = session;
            break;
        }
    }
    if (!matchedSession) {
        throw new AppError(status.UNAUTHORIZED, "Session not found");
    }
    if (matchedSession.expires_at < new Date()) {
        throw new AppError(status.UNAUTHORIZED, "Session expired");
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.is_deleted) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const newAccessToken = tokenUtils.getAccessToken(jwtPayload);
    const newRefreshToken = tokenUtils.getRefreshToken(jwtPayload);
    const newHashedRefreshToken = await bcryptUtils.hash(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.update({
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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
const changePassword = async (userId, payload) => {
    const { oldPassword, newPassword } = payload;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    const isPasswordMatched = await bcryptUtils.compare(oldPassword, user.password);
    if (!isPasswordMatched) {
        throw new AppError(status.UNAUTHORIZED, "Invalid old password");
    }
    const hashedNewPassword = await bcryptUtils.hash(newPassword);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });
    await prisma.session.deleteMany({ where: { user_id: userId } });
    return null;
};
const logoutUser = async (refreshToken) => {
    if (!refreshToken)
        return;
    try {
        const verifiedToken = jwtUtils.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);
        if (!verifiedToken.success)
            return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { userId } = verifiedToken.data;
        const userSessions = await prisma.session.findMany({ where: { user_id: userId } });
        for (const session of userSessions) {
            if (await bcryptUtils.compare(refreshToken, session.refresh_token)) {
                await prisma.session.delete({ where: { id: session.id } });
                break;
            }
        }
    }
    catch (error) {
        // ignore errors during logout token parsing
    }
};
export const authService = {
    createUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
};
