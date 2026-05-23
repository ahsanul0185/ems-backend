import { IQueryParams } from "../../interfaces/query.interface";
import { PayslipStatus } from "../../../generated/prisma/enums";

export interface ICreatePayslipPayload {
  employee_id: string;
  pay_period_month: number;
  pay_period_year: number;
  pay_date: Date;
  basic_salary: number;
  bonus?: number;
  deduction?: number;
  net_salary: number;
  notes?: string;
}

export interface IPayslipQueryParams extends IQueryParams {
  status?: PayslipStatus | string;
  employee_id?: string;
  pay_period_month?: string;
  pay_period_year?: string;
}
