import { Router } from "express";
import { authRoutes } from "../module/auth/auth.route";
import { employeeRoutes } from "../module/employee/employee.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);

export const IndexRoutes = router;