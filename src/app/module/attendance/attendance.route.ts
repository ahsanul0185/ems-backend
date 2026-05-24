import { Router } from "express";
import { attendanceController } from "./attendance.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { attendanceValidation } from "./attendance.validation";

const router = Router();

// Employee routes
router.post("/clock-in", checkAuth() , attendanceController.clockIn);
router.post("/clock-out", checkAuth(), attendanceController.clockOut);
// router.get("/today", checkAuth(), attendanceController.getTodayAttendance);
router.get("/me", checkAuth(UserRole.EMPLOYEE), attendanceController.getMyAttendance);

// HR routes
router.get("/details/:id", checkAuth(UserRole.HR), attendanceController.getAttendanceDetailsById);
router.get("/", checkAuth(UserRole.HR), attendanceController.getAllAttendance);
router.get("/:employeeId", checkAuth(UserRole.HR), attendanceController.getAttendanceByEmployee);
router.post("/hr/clock-in", checkAuth(UserRole.HR), validateRequest(attendanceValidation.clockInSchema), attendanceController.hrClockIn);
router.post("/hr/clock-out", checkAuth(UserRole.HR), validateRequest(attendanceValidation.clockOutSchema), attendanceController.hrClockOut);
router.put("/hr/:id/informed", checkAuth(UserRole.HR), validateRequest(attendanceValidation.markInformedSchema), attendanceController.hrMarkInformed);
router.put("/hr/:id", checkAuth(UserRole.HR), validateRequest(attendanceValidation.updateRecordSchema), attendanceController.hrUpdateRecord);

export const attendanceRoutes = router;