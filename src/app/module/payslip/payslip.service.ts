import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryResult } from "../../interfaces/query.interface";
import { ICreatePayslipPayload, IPayslipQueryParams } from "./payslip.interface";
import { Payslip, PayslipStatus } from "../../../generated/prisma/client";

const generatePayslip = async (payload: ICreatePayslipPayload, generatedBy: string) => {
  const employee = await prisma.employee.findUnique({ where: { id: payload.employee_id } });
  if (!employee) {
    throw new AppError(status.NOT_FOUND, "Employee not found");
  }

  const hrProfile = await prisma.hRProfile.findUnique({ where: { id: generatedBy } });
  if (!hrProfile) {
    throw new AppError(status.FORBIDDEN, "Authenticated HR profile not found");
  }

  const existingPayslip = await prisma.payslip.findFirst({
    where: {
      employee_id: payload.employee_id,
      pay_period_month: payload.pay_period_month,
      pay_period_year: payload.pay_period_year,
    }
  });

  if (existingPayslip) {
    throw new AppError(status.BAD_REQUEST, "Payslip already exists for this employee and pay period");
  }

  const payslip = await prisma.payslip.create({
    data: {
      ...payload,
      generated_by: generatedBy,
    }
  });

  return { payslip };
};

const getMyPayslips = async (employeeId: string, queryParams: IPayslipQueryParams): Promise<IQueryResult<Payslip>> => {
  const builder = new QueryBuilder<Payslip>(
    prisma.payslip,
    queryParams,
    {
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
    }
  )
    .where({ employee_id: employeeId })
    .search()
    .filter()
    .sort()
    .paginate();

  return builder.execute();
};

const getMyPayslipById = async (payslipId: string, employeeId: string) => {
  const payslip = await prisma.payslip.findFirst({
    where: {
      id: payslipId,
      employee_id: employeeId,
    },
  });

  if (!payslip) {
    throw new AppError(status.NOT_FOUND, "Payslip not found");
  }

  return { payslip };
};

const getAllPayslips = async (queryParams: IPayslipQueryParams): Promise<IQueryResult<Payslip>> => {
  const builder = new QueryBuilder<Payslip>(
    prisma.payslip,
    queryParams,
    {
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
    }
  )
    .search()
    .filter()
    .sort()
    .paginate();

  return builder.execute();
};

const getPayslipById = async (payslipId: string) => {
  const payslip = await prisma.payslip.findUnique({
    where: { id: payslipId },
    include: {
      employee: true,
      generated_emp: true,
    },
  });

  if (!payslip) {
    throw new AppError(status.NOT_FOUND, "Payslip not found");
  }

  return { payslip };
};

const approvePayslip = async (payslipId: string) => {
  const payslip = await prisma.payslip.findUnique({ where: { id: payslipId } });

  if (!payslip) {
    throw new AppError(status.NOT_FOUND, "Payslip not found");
  }

  if (payslip.status !== PayslipStatus.DRAFT) {
    throw new AppError(status.BAD_REQUEST, "Only draft payslips can be approved");
  }

  const updated = await prisma.payslip.update({
    where: { id: payslipId },
    data: {
      status: PayslipStatus.APPROVED,
    }
  });

  return { payslip: updated };
};

const markPaidPayslip = async (payslipId: string) => {
  const payslip = await prisma.payslip.findUnique({ where: { id: payslipId } });

  if (!payslip) {
    throw new AppError(status.NOT_FOUND, "Payslip not found");
  }

  if (payslip.status !== PayslipStatus.APPROVED) {
    throw new AppError(status.BAD_REQUEST, "Only approved payslips can be marked as paid");
  }

  const updated = await prisma.payslip.update({
    where: { id: payslipId },
    data: {
      status: PayslipStatus.PAID,
    }
  });

  return { payslip: updated };
};

export const payslipService = {
  generatePayslip,
  getMyPayslips,
  getMyPayslipById,
  getAllPayslips,
  getPayslipById,
  approvePayslip,
  markPaidPayslip,
};
