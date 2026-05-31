"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const http_status_1 = __importDefault(require("http-status"));
const enums_1 = require("../../generated/prisma/enums");
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const prisma_1 = require("../lib/prisma");
const cookie_1 = require("../utils/cookie");
const jwt_1 = require("../utils/jwt");
const checkAuth = (...authRoles) => async (req, res, next) => {
    try {
        const accessToken = cookie_1.CookieUtils.getCookie(req, 'accessToken') || req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access! No access token provided.');
        }
        const verifiedToken = jwt_1.jwtUtils.verifyToken(accessToken, env_1.env.ACCESS_TOKEN_SECRET);
        if (!verifiedToken.success || !verifiedToken.data) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access! Invalid or expired access token.');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userData = verifiedToken.data;
        const userId = userData.userId || userData.id;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId }, include: { employee: { select: { id: true } }, hr_profile: { select: { id: true } } } });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access! User not found.');
        }
        if (user.status === enums_1.UserStatus.INACTIVE || user.status === enums_1.UserStatus.DELETED) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access! User is not active.');
        }
        if (user.is_deleted) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access! User is deleted.');
        }
        req.user = {
            userId: user.id,
            role: user.role,
            email: user.email,
            employeeId: user.employee?.id,
            hrProfileId: user.hr_profile?.id,
        };
        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Forbidden access! You do not have permission to access this resource.');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkAuth = checkAuth;
