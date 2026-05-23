

import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { leaveController } from "./leave.controller";
import { createLeaveZodSchema, rejectLeaveZodSchema } from "./leave.validation";

const router = Router();

router.get("/me", checkAuth(), leaveController.getMyLeaves);
router.post("/", checkAuth(), validateRequest(createLeaveZodSchema), leaveController.applyLeave);
router.put("/:id/cancel", checkAuth(), leaveController.cancelLeave);

router.get("/", checkAuth(), leaveController.getAllLeaves);
router.get("/:id", checkAuth(UserRole.HR, UserRole.ADMIN), leaveController.getLeaveById);
router.put("/:id/approve", checkAuth(), leaveController.approveLeave);
router.put("/:id/reject", checkAuth(), validateRequest(rejectLeaveZodSchema), leaveController.rejectLeave);

export const leaveRoutes = router;