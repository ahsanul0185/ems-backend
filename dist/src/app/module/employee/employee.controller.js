import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { employeeService } from "./employee.service";
const createEmployee = catchAsync(async (req, res) => {
    const payload = req.body;
    const result = await employeeService.createEmployee(payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Employee created successfully",
        data: {
            employee: result.employee,
        }
    });
});
const updateEmployee = catchAsync(async (req, res) => {
    const employeeId = req.params.id;
    const payload = req.body;
    const result = await employeeService.updateEmployee(employeeId, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee updated successfully",
        data: {
            employee: result.employee,
        }
    });
});
const getEmployeeById = catchAsync(async (req, res) => {
    const employeeId = req.params.id;
    const result = await employeeService.getEmployeeById(employeeId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee retrieved successfully",
        data: {
            employee: result.employee,
        }
    });
});
const deleteEmployee = catchAsync(async (req, res) => {
    const employeeId = req.params.id;
    const result = await employeeService.deleteEmployee(employeeId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee deleted successfully",
        data: {
            employee: result.employee,
        }
    });
});
const getAllEmployees = catchAsync(async (req, res) => {
    const queryParams = req.query;
    const result = await employeeService.getAllEmployees(queryParams);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employees retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
export const employeeController = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    deleteEmployee,
    getAllEmployees,
};
