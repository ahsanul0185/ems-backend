import z from "zod";

const parseDate = z.preprocess((value) => {
  if (typeof value === "string" || value instanceof Date) {
    return new Date(value);
  }
  return value;
}, z.date());

export const createPayslipSchema = z.object({
  employee_id: z.string().uuid("employee_id must be a valid UUID"),
  pay_period_month: z.coerce.number().int().min(1, "pay_period_month must be between 1 and 12").max(12, "pay_period_month must be between 1 and 12"),
  pay_period_year: z.coerce.number().int().min(2000, "pay_period_year must be a valid year"),
  pay_date: parseDate,
  basic_salary: z.coerce.number().int().min(0, "basic_salary must be at least 0"),
  bonus: z.coerce.number().int().min(0, "bonus must be at least 0").optional(),
  deduction: z.coerce.number().int().min(0, "deduction must be at least 0").optional(),
  net_salary: z.coerce.number().int().min(0, "net_salary must be at least 0"),
  notes: z.string().optional(),
});
