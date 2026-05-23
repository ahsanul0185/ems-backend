import { NextFunction, Request, Response } from "express";
import z from "zod";
import status from "http-status";
import AppError from "../errorHelpers/AppError";

export const validateRequest = (zodSchema: z.ZodObject<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // If data is sent as a JSON string in a 'data' field (common in form-data uploads)
        if (req.body.data) {
            try {
                req.body = JSON.parse(req.body.data);
            } catch (error) {
                return next(new Error("Invalid JSON in 'data' field"));
            }
        }

        const parsedResult = zodSchema.safeParse(req.body);

        if (!parsedResult.success) {
            const firstIssue = parsedResult.error.issues[0];
            const errorMessage = firstIssue.message;
            throw new AppError(status.BAD_REQUEST, errorMessage);
        }

        // Sanitizing and updating req.body
        req.body = parsedResult.data;

        next();
    };
};
