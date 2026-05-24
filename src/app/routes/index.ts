import { Router } from "express";
import { authRoutes } from "../module/auth/auth.route";
import { employeeRoutes } from "../module/employee/employee.route";
import { departmentRoutes } from "../module/department/department.route";
import { userRoutes } from "../module/user/user.route";
import { leaveRoutes } from "../module/leave/leave.route";
import { payslipRoutes } from "../module/payslip/payslip.route";
import { announcementRoutes } from "../module/announcement/announcement.route";
import { holidayRoutes } from "../module/holiday/holiday.route";
import { attendanceRoutes } from "../module/attendance/attendance.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/departments", departmentRoutes);
router.use("/users", userRoutes);
router.use("/leaves", leaveRoutes);
router.use("/payslips", payslipRoutes);
router.use("/announcements", announcementRoutes);
router.use("/holidays", holidayRoutes);
router.use("/attendance", attendanceRoutes);

export const IndexRoutes = router;