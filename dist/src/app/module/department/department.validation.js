"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepartmentZodSchema = exports.createDepartmentZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createDepartmentZodSchema = zod_1.default.object({
    name: zod_1.default.string("Department name is required"),
    description: zod_1.default.string().optional(),
    is_active: zod_1.default.boolean().optional(),
});
exports.updateDepartmentZodSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    description: zod_1.default.string().optional(),
    is_active: zod_1.default.boolean().optional(),
});
