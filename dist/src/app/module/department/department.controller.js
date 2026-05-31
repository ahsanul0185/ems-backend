"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const department_service_1 = require("./department.service");
const http_status_1 = __importDefault(require("http-status"));
const createDepartment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await department_service_1.departmentService.createDepartment(payload);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.CREATED,
        success: true,
        message: "Department created successfully",
        data: result
    });
});
const getAllDepartments = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await department_service_1.departmentService.getAllDepartments();
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Departments fetched successfully",
        data: result,
    });
});
const updateDepartment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const departmentId = req.params.id;
    const payload = req.body;
    const result = await department_service_1.departmentService.updateDepartment(departmentId, payload);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Department updated successfully",
        data: result,
    });
});
const deleteDepartment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const departmentId = req.params.id;
    const result = await department_service_1.departmentService.deleteDepartment(departmentId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Department deleted successfully",
        data: result,
    });
});
exports.departmentController = {
    createDepartment,
    getAllDepartments,
    updateDepartment,
    deleteDepartment,
};
