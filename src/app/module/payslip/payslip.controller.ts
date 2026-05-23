import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { payslipService } from "./payslip.service";
import { IPayslipQueryParams } from "./payslip.interface";

const getMyPayslips = catchAsync(
  async (req: Request, res: Response) => {
    const employeeId = req.user?.employeeId;
    const queryParams = req.query as unknown as IPayslipQueryParams;

    if (!employeeId) {
      throw new AppError(status.BAD_REQUEST, "Authenticated employee_id is required to fetch payslips");
    }

    const result = await payslipService.getMyPayslips(employeeId, queryParams);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Payslips retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getMyPayslipById = catchAsync(
  async (req: Request, res: Response) => {
    const employeeId = req.user?.employeeId;
    const payslipId = req.params.id;

    if (!employeeId) {
      throw new AppError(status.BAD_REQUEST, "Authenticated employee_id is required to fetch the payslip");
    }

    const result = await payslipService.getMyPayslipById(payslipId as string, employeeId);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Payslip retrieved successfully",
      data: result.payslip
    });
  }
);

const getAllPayslips = catchAsync(
  async (req: Request, res: Response) => {
    const queryParams = req.query as unknown as IPayslipQueryParams;
    const result = await payslipService.getAllPayslips(queryParams);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Payslips retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const generatePayslip = catchAsync(
  async (req: Request, res: Response) => {
    const hrProfileId = req.user?.hrProfileId;

    if (!hrProfileId) {
      throw new AppError(status.FORBIDDEN, "Authenticated HR profile is required to generate payslips");
    }

    const payload = req.body;
    const result = await payslipService.generatePayslip(payload, hrProfileId);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Payslip generated successfully",
      data: result.payslip,
    });
  }
);

const getPayslipById = catchAsync(
  async (req: Request, res: Response) => {
    const payslipId = req.params.id;
    const result = await payslipService.getPayslipById(payslipId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Payslip retrieved successfully",
      data: result.payslip,
    });
  }
);

const approvePayslip = catchAsync(
  async (req: Request, res: Response) => {
    const payslipId = req.params.id;
    const result = await payslipService.approvePayslip(payslipId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Payslip approved successfully",
      data: result.payslip,
    });
  }
);

const markPaidPayslip = catchAsync(
  async (req: Request, res: Response) => {
    const payslipId = req.params.id;
    const result = await payslipService.markPaidPayslip(payslipId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Payslip marked as paid successfully",
      data: result.payslip,
    });
  }
);

export const payslipController = {
  getMyPayslips,
  getMyPayslipById,
  getAllPayslips,
  generatePayslip,
  getPayslipById,
  approvePayslip,
  markPaidPayslip,
};
