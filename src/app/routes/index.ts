import { Router } from "express";
import { authRoutes } from "../module/auth/auth.route";
import { employeeRoutes } from "../module/employee/employee.route";
import { departmentRoutes } from "../module/department/department.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/departments", departmentRoutes);

export const IndexRoutes = router;