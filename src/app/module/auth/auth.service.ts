import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { bcryptUtils } from "../../utils/bcrypt";
import { jwtUtils } from "../../utils/jwt";
import { tokenUtils } from "../../utils/token";
import { env } from "../../config/env";
import { IChangePasswordPayload, ICreateUserPayload, ILoginMeta, ILoginUserPayload } from "./auth.interface";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";

const toISODateTime = (dateStr: string): Date => {
    return new Date(dateStr + "T00:00:00.000Z");
};

const createUser = async (payload: ICreateUserPayload) => {
    const {
        email, password, role,
        employee_code, date_of_birth, join_date,
        ...restEmployeeData
    } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (isUserExist) {
        throw new AppError(status.BAD_REQUEST, "User already exists with this email");
    }

    const isEmployeeCodeTaken = await prisma.employee.findUnique({
        where: { employee_code }
    });

    if (isEmployeeCodeTaken) {
        throw new AppError(status.BAD_REQUEST, "Employee code already exists");
    }

    const hashedPassword = await bcryptUtils.hash(password);

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
            }
        });

        // Create employee profile for EMPLOYEE and HR roles
        if (role === UserRole.EMPLOYEE || role === UserRole.HR) {
            await tx.employee.create({
                data: {
                    ...restEmployeeData,
                    user_id: user.id,
                    employee_code,
                    date_of_birth: toISODateTime(date_of_birth),
                    join_date: toISODateTime(join_date),
                },
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword };
    });

    return result;
}

const loginUser = async (payload: ILoginUserPayload, meta?: ILoginMeta) => {
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
            ip_address: meta?.ip_address ?? null,
            user_agent: meta?.user_agent ?? null,
            device_info: meta?.device_info ?? null,
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
}

const getNewToken = async (refreshToken: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);

    if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { userId } = verifiedRefreshToken.data as any;

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
}

const getMe = async (userId: string) => { 
    const user = await prisma.user.findUnique({
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
                select: {
                    id: true,
                    employee_code: true,
                    first_name: true,
                    last_name: true,
                    phone: true,
                }
            },
            hr_profile: {
                select: {
                    id: true,
                }
            },
        }
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
        name: user.employee ? `${user.employee.first_name} ${user.employee.last_name}` : null,
        employee_id: user.employee?.id ?? null,
        employee_code: user.employee?.employee_code ?? null,
        phone: user.employee?.phone ?? null,
        hr_id: user.hr_profile?.id ?? null,
    };
}

const getMyProfile = async (userId: string) => { 
    const user = await prisma.user.findUnique({ 
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
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return user;
}

const changePassword = async (userId: string, payload: IChangePasswordPayload) => {
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
}

const logoutUser = async (refreshToken: string) => {
    if (!refreshToken) return;
    try {
        const verifiedToken = jwtUtils.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);
        if (!verifiedToken.success) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { userId } = verifiedToken.data as any;
        const userSessions = await prisma.session.findMany({ where: { user_id: userId } });
        for (const session of userSessions) {
            if (await bcryptUtils.compare(refreshToken, session.refresh_token)) {
                await prisma.session.delete({ where: { id: session.id } });
                break;
            }
        }
    } catch (error) {
        // ignore errors during logout token parsing
    }
}

const getUserSessions = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    const sessions = await prisma.session.findMany({
        where: { user_id: userId },
        select: {
            id: true,
            user_id: true,
            created_at: true,
            updated_at: true,
            expires_at: true,
            ip_address: true,
            user_agent: true,
            device_info: true,
        },
        orderBy: { created_at: 'desc' }
    });

    return sessions;
}

const revokeSession = async (sessionId: string, adminUserId: string) => {
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true }
    });

    if (!session) {
        throw new AppError(status.NOT_FOUND, "Session not found");
    }

    // Prevent admin from revoking their own current session via this endpoint
    // (optional guard; can be removed if not desired)
    if (session.user_id === adminUserId) {
        throw new AppError(status.FORBIDDEN, "You cannot revoke your own session from here");
    }

    await prisma.session.delete({ where: { id: sessionId } });

    return { revoked: true };
}

export const authService = {
    createUser,
    loginUser,
    getMe,
    getMyProfile,
    getNewToken,
    changePassword,
    logoutUser,
    getUserSessions,
    revokeSession,
};