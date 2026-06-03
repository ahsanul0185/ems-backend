import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get('/admin', checkAuth(UserRole.ADMIN, UserRole.HR), dashboardController.getAdminDashboardData);
router.get('/hr', checkAuth(UserRole.ADMIN, UserRole.HR), dashboardController.getHrDashboardData);

export const dashboardRoutes = router;
