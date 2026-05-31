"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const validateRequest = (zodSchema) => {
    return (req, res, next) => {
        // If data is sent as a JSON string in a 'data' field (common in form-data uploads)
        if (req.body.data) {
            try {
                req.body = JSON.parse(req.body.data);
            }
            catch (error) {
                return next(new Error("Invalid JSON in 'data' field"));
            }
        }
        const parsedResult = zodSchema.safeParse(req.body);
        if (!parsedResult.success) {
            const firstIssue = parsedResult.error.issues[0];
            const errorMessage = firstIssue.message;
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, errorMessage);
        }
        // Sanitizing and updating req.body
        req.body = parsedResult.data;
        next();
    };
};
exports.validateRequest = validateRequest;
