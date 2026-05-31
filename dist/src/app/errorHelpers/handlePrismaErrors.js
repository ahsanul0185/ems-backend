"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerPrismaClientRustPanicError = exports.handlerPrismaClientInitializationError = exports.handlePrismaClientValidationError = exports.handlePrismaClientUnknownError = exports.handlePrismaClientKnownRequestError = void 0;
const http_status_1 = __importDefault(require("http-status"));
const getStatusCodeFromPrismaError = (errorCode) => {
    if (errorCode === "P2002") {
        return http_status_1.default.CONFLICT;
    }
    if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
        return http_status_1.default.NOT_FOUND;
    }
    if (["P1000", "P6002"].includes(errorCode)) {
        return http_status_1.default.UNAUTHORIZED;
    }
    if (["P1010", "P6010"].includes(errorCode)) {
        return http_status_1.default.FORBIDDEN;
    }
    if (errorCode === "P6003") {
        return http_status_1.default.PAYMENT_REQUIRED;
    }
    if (["P1008", "P2004", "P6004"].includes(errorCode)) {
        return http_status_1.default.GATEWAY_TIMEOUT;
    }
    if (errorCode === "P5011") {
        return http_status_1.default.TOO_MANY_REQUESTS;
    }
    if (errorCode === "P6009") {
        return 413;
    }
    if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) {
        return http_status_1.default.SERVICE_UNAVAILABLE;
    }
    if (errorCode.startsWith("P2")) {
        return http_status_1.default.BAD_REQUEST;
    }
    if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
        return http_status_1.default.INTERNAL_SERVER_ERROR;
    }
    return http_status_1.default.INTERNAL_SERVER_ERROR;
};
const handlePrismaClientKnownRequestError = (error) => {
    const statusCode = getStatusCodeFromPrismaError(error.code);
    const meta = error.meta;
    const modelName = meta?.modelName;
    const cause = meta?.cause;
    const target = meta?.target;
    let message;
    let errorPath = error.code;
    switch (error.code) {
        case "P2025":
            message = modelName
                ? `${modelName} record not found`
                : cause
                    ? cause
                    : "The requested record was not found";
            break;
        case "P2001":
            message = modelName
                ? `${modelName} record does not exist`
                : "The record searched for in the where condition does not exist";
            break;
        case "P2002": {
            const fields = Array.isArray(target) ? target.join(", ") : (target ?? "field");
            message = `A record with this ${fields} already exists`;
            errorPath = String(fields);
            break;
        }
        case "P2003": {
            const field = meta?.field_name;
            message = field
                ? `Foreign key constraint failed on field: ${field}`
                : "Foreign key constraint failed";
            errorPath = field ?? error.code;
            break;
        }
        case "P2011": {
            const field = meta?.constraint;
            message = field
                ? `${field} is required and cannot be null`
                : "A required field cannot be null";
            errorPath = field ?? error.code;
            break;
        }
        case "P2014":
            message = "The change would violate a required relation between models";
            break;
        case "P2015":
            message = "A related record could not be found";
            break;
        case "P2016":
            message = "Query interpretation error — check your query parameters";
            break;
        case "P2018":
            message = "The required connected records were not found";
            break;
        case "P2019":
            message = "Input error in the query";
            break;
        case "P2023":
            message = "Inconsistent column data — a value provided is invalid for the field type";
            break;
        case "P2024":
            message = "Database connection timed out. Please try again";
            break;
        case "P2007": {
            const driverError = meta?.driverAdapterError;
            const originalMessage = driverError?.cause?.originalMessage;
            message = originalMessage?.includes("uuid")
                ? "Invalid ID format — please provide a valid UUID"
                : originalMessage || "Invalid input value — check your parameters";
            break;
        }
        default: {
            const cleanMessage = error.message
                .replace(/Invalid `.*?` invocation:?\s*/i, "")
                .split("\n")
                .map((l) => l.trim())
                .find((l) => l.length > 5) ?? "A database error occurred";
            message = cleanMessage;
        }
    }
    const errorSources = [{ path: errorPath, message }];
    if (cause && error.code !== "P2025") {
        errorSources.push({ path: "cause", message: cause });
    }
    return {
        success: false,
        statusCode,
        message,
        errorSources,
    };
};
exports.handlePrismaClientKnownRequestError = handlePrismaClientKnownRequestError;
const handlePrismaClientUnknownError = (error) => {
    const cleanMessage = error.message
        .replace(/Invalid `.*?` invocation:?\s*/i, "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)[0] ?? "An unknown database error occurred";
    return {
        success: false,
        statusCode: http_status_1.default.INTERNAL_SERVER_ERROR,
        message: cleanMessage,
        errorSources: [{ path: "database", message: cleanMessage }],
    };
};
exports.handlePrismaClientUnknownError = handlePrismaClientUnknownError;
const handlePrismaClientValidationError = (error) => {
    const cleanMessage = error.message
        .replace(/Invalid `.*?` invocation:?\s*/i, "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    const fieldMatch = error.message.match(/Argument `(\w+)`/i);
    const fieldName = fieldMatch ? fieldMatch[1] : "field";
    const mainMessage = cleanMessage.find((l) => !l.includes("Argument") && !l.includes("→") && l.length > 10) ?? cleanMessage[0] ?? "Invalid data provided for this operation";
    return {
        success: false,
        statusCode: http_status_1.default.BAD_REQUEST,
        message: "Validation failed — check the data you submitted",
        errorSources: [{ path: fieldName, message: mainMessage }],
    };
};
exports.handlePrismaClientValidationError = handlePrismaClientValidationError;
const handlerPrismaClientInitializationError = (error) => {
    const statusCode = error.errorCode
        ? getStatusCodeFromPrismaError(error.errorCode)
        : http_status_1.default.SERVICE_UNAVAILABLE;
    const mainMessage = error.message
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)[0] ?? "Database service is unavailable";
    return {
        success: false,
        statusCode,
        message: mainMessage,
        errorSources: [{ path: error.errorCode ?? "initialization", message: mainMessage }],
    };
};
exports.handlerPrismaClientInitializationError = handlerPrismaClientInitializationError;
const handlerPrismaClientRustPanicError = () => ({
    success: false,
    statusCode: http_status_1.default.INTERNAL_SERVER_ERROR,
    message: "A critical database engine error occurred. Please contact support.",
    errorSources: [
        {
            path: "database_engine",
            message: "The Prisma engine encountered a fatal panic. Please check server logs.",
        },
    ],
});
exports.handlerPrismaClientRustPanicError = handlerPrismaClientRustPanicError;
