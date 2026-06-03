"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceRoutes = void 0;
const express_1 = require("express");
const attendance_controller_1 = require("./attendance.controller");
const checkAuth_1 = require("../../middleware/checkAuth");
const enums_1 = require("../../../generated/prisma/enums");
const validateRequest_1 = require("../../middleware/validateRequest");
const attendance_validation_1 = require("./attendance.validation");
const router = (0, express_1.Router)();
// Employee routes
// router.post("/clock-in", checkAuth(), validateRequest(attendanceValidation.clockInSchema), attendanceController.clockIn);
// router.post("/clock-out", checkAuth(), validateRequest(attendanceValidation.clockOutSchema), attendanceController.clockOut);
// router.get("/today", checkAuth(), attendanceController.getTodayAttendance);
router.get("/me", (0, checkAuth_1.checkAuth)(enums_1.UserRole.EMPLOYEE), attendance_controller_1.attendanceController.getMyAttendance);
// HR + Admin routes
router.get("/details/:id", (0, checkAuth_1.checkAuth)(enums_1.UserRole.HR, enums_1.UserRole.ADMIN), attendance_controller_1.attendanceController.getAttendanceDetailsById);
router.get("/", (0, checkAuth_1.checkAuth)(enums_1.UserRole.HR, enums_1.UserRole.ADMIN), attendance_controller_1.attendanceController.getAllAttendance);
router.get("/:employeeId", (0, checkAuth_1.checkAuth)(enums_1.UserRole.HR, enums_1.UserRole.ADMIN), attendance_controller_1.attendanceController.getAttendanceByEmployee);
router.post("/hr/clock-in", (0, checkAuth_1.checkAuth)(enums_1.UserRole.HR, enums_1.UserRole.ADMIN), (0, validateRequest_1.validateRequest)(attendance_validation_1.attendanceValidation.clockInSchema), attendance_controller_1.attendanceController.hrClockIn);
router.post("/hr/clock-out", (0, checkAuth_1.checkAuth)(enums_1.UserRole.HR, enums_1.UserRole.ADMIN), (0, validateRequest_1.validateRequest)(attendance_validation_1.attendanceValidation.clockOutSchema), attendance_controller_1.attendanceController.hrClockOut);
router.put("/hr/:id/informed", (0, checkAuth_1.checkAuth)(enums_1.UserRole.HR, enums_1.UserRole.ADMIN), (0, validateRequest_1.validateRequest)(attendance_validation_1.attendanceValidation.markInformedSchema), attendance_controller_1.attendanceController.hrMarkInformed);
router.put("/hr/:id", (0, checkAuth_1.checkAuth)(enums_1.UserRole.HR, enums_1.UserRole.ADMIN), (0, validateRequest_1.validateRequest)(attendance_validation_1.attendanceValidation.updateRecordSchema), attendance_controller_1.attendanceController.hrUpdateRecord);
exports.attendanceRoutes = router;
