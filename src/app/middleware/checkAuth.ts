import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { env } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";

export const checkAuth = (...authRoles: UserRole[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = CookieUtils.getCookie(req, 'accessToken') || req.headers.authorization?.split(' ')[1];

        if (!accessToken) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No access token provided.');
        }

        const verifiedToken = jwtUtils.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET);

        if (!verifiedToken.success || !verifiedToken.data) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! Invalid or expired access token.');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userData = verifiedToken.data as any;
        const userId = userData.userId || userData.id;

        const user = await prisma.user.findUnique({ where: { id: userId }, include: { employee: { select: { id: true } }, hr_profile : { select : {id : true}} } });

        if (!user) {
             throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User not found.');
        }

        if (user.status === UserStatus.INACTIVE || user.status === UserStatus.DELETED) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User is not active.');
        }

        if (user.is_deleted) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User is deleted.');
        }

        req.user = {
            userId: user.id,
            role: user.role,
            email: user.email,
            employeeId: user.employee?.id,
            hrProfileId: user.hr_profile?.id,
        };

        if (authRoles.length > 0 && !authRoles.includes(user.role as UserRole)) {
            throw new AppError(status.FORBIDDEN, 'Forbidden access! You do not have permission to access this resource.');
        }

        next();
    } catch (error: any) {
        next(error);
    }
};