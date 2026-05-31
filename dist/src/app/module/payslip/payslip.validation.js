"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayslipSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const parseDate = zod_1.default.preprocess((value) => {
    if (typeof value === "string" || value instanceof Date) {
        return new Date(value);
    }
    return value;
}, zod_1.default.date());
exports.createPayslipSchema = zod_1.default.object({
    employee_id: zod_1.default.string().uuid("employee_id must be a valid UUID"),
    pay_period_month: zod_1.default.coerce.number().int().min(1, "pay_period_month must be between 1 and 12").max(12, "pay_period_month must be between 1 and 12"),
    pay_period_year: zod_1.default.coerce.number().int().min(2000, "pay_period_year must be a valid year"),
    pay_date: parseDate,
    basic_salary: zod_1.default.coerce.number().int().min(0, "basic_salary must be at least 0"),
    bonus: zod_1.default.coerce.number().int().min(0, "bonus must be at least 0").optional(),
    deduction: zod_1.default.coerce.number().int().min(0, "deduction must be at least 0").optional(),
    net_salary: zod_1.default.coerce.number().int().min(0, "net_salary must be at least 0"),
    notes: zod_1.default.string().optional(),
});
