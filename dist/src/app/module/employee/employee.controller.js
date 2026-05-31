"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const http_status_1 = __importDefault(require("http-status"));
const employee_service_1 = require("./employee.service");
const createEmployee = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await employee_service_1.employeeService.createEmployee(payload);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.CREATED,
        success: true,
        message: "Employee created successfully",
        data: {
            employee: result.employee,
        }
    });
});
const updateEmployee = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.params.id;
    const payload = req.body;
    const result = await employee_service_1.employeeService.updateEmployee(employeeId, payload);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Employee updated successfully",
        data: {
            employee: result.employee,
        }
    });
});
const getEmployeeById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.params.id;
    const result = await employee_service_1.employeeService.getEmployeeById(employeeId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Employee retrieved successfully",
        data: {
            employee: result.employee,
        }
    });
});
const deleteEmployee = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const employeeId = req.params.id;
    const result = await employee_service_1.employeeService.deleteEmployee(employeeId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Employee deleted successfully",
        data: {
            employee: result.employee,
        }
    });
});
const getAllEmployees = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const queryParams = req.query;
    const result = await employee_service_1.employeeService.getAllEmployees(queryParams);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Employees retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
exports.employeeController = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    deleteEmployee,
    getAllEmployees,
};
