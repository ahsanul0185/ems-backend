"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payslipService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const client_1 = require("../../../generated/prisma/client");
const generatePayslip = async (payload, generatedBy) => {
    const employee = await prisma_1.prisma.employee.findUnique({ where: { id: payload.employee_id } });
    if (!employee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Employee not found");
    }
    const hrProfile = await prisma_1.prisma.hRProfile.findUnique({ where: { id: generatedBy } });
    if (!hrProfile) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Authenticated HR profile not found");
    }
    const existingPayslip = await prisma_1.prisma.payslip.findFirst({
        where: {
            employee_id: payload.employee_id,
            pay_period_month: payload.pay_period_month,
            pay_period_year: payload.pay_period_year,
        }
    });
    if (existingPayslip) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Payslip already exists for this employee and pay period");
    }
    const payslip = await prisma_1.prisma.payslip.create({
        data: {
            ...payload,
            generated_by: generatedBy,
        }
    });
    return { payslip };
};
const getMyPayslips = async (employeeId, queryParams) => {
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.payslip, queryParams, {
        searchableFields: ["notes"],
        filterableFields: ["status", "employee_id", "pay_period_month", "pay_period_year"],
        defaultSelect: {
            id: true,
            employee_id: true,
            pay_period_month: true,
            pay_period_year: true,
            pay_date: true,
            basic_salary: true,
            bonus: true,
            deduction: true,
            net_salary: true,
            status: true,
            generated_by: true,
        }
    })
        .where({ employee_id: employeeId })
        .search()
        .filter()
        .sort()
        .paginate();
    return builder.execute();
};
const getMyPayslipById = async (payslipId, employeeId) => {
    const payslip = await prisma_1.prisma.payslip.findFirst({
        where: {
            id: payslipId,
            employee_id: employeeId,
        },
    });
    if (!payslip) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Payslip not found");
    }
    return { payslip };
};
const getAllPayslips = async (queryParams) => {
    const builder = new QueryBuilder_1.QueryBuilder(prisma_1.prisma.payslip, queryParams, {
        searchableFields: ["notes", "employee.first_name", "employee.last_name"],
        filterableFields: ["status", "employee_id", "pay_period_month", "pay_period_year"],
        defaultSelect: {
            id: true,
            employee_id: true,
            pay_period_month: true,
            pay_period_year: true,
            pay_date: true,
            basic_salary: true,
            bonus: true,
            deduction: true,
            net_salary: true,
            status: true,
            generated_by: true,
            employee: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                }
            }
        }
    })
        .search()
        .filter()
        .sort()
        .paginate();
    return builder.execute();
};
const getPayslipById = async (payslipId) => {
    const payslip = await prisma_1.prisma.payslip.findUnique({
        where: { id: payslipId },
        include: {
            employee: true,
            generated_emp: true,
        },
    });
    if (!payslip) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Payslip not found");
    }
    return { payslip };
};
const approvePayslip = async (payslipId) => {
    const payslip = await prisma_1.prisma.payslip.findUnique({ where: { id: payslipId } });
    if (!payslip) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Payslip not found");
    }
    if (payslip.status !== client_1.PayslipStatus.DRAFT) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Only draft payslips can be approved");
    }
    const updated = await prisma_1.prisma.payslip.update({
        where: { id: payslipId },
        data: {
            status: client_1.PayslipStatus.APPROVED,
        }
    });
    return { payslip: updated };
};
const markPaidPayslip = async (payslipId) => {
    const payslip = await prisma_1.prisma.payslip.findUnique({ where: { id: payslipId } });
    if (!payslip) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Payslip not found");
    }
    if (payslip.status !== client_1.PayslipStatus.APPROVED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Only approved payslips can be marked as paid");
    }
    const updated = await prisma_1.prisma.payslip.update({
        where: { id: payslipId },
        data: {
            status: client_1.PayslipStatus.PAID,
        }
    });
    return { payslip: updated };
};
exports.payslipService = {
    generatePayslip,
    getMyPayslips,
    getMyPayslipById,
    getAllPayslips,
    getPayslipById,
    approvePayslip,
    markPaidPayslip,
};
