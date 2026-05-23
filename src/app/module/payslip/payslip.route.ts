


import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { payslipController } from "./payslip.controller";
import { createPayslipSchema } from "./payslip.validation";

const router = Router();

router.get("/me", checkAuth(), payslipController.getMyPayslips);
router.get("/me/:id", checkAuth(), payslipController.getMyPayslipById);

router.get("/", checkAuth(), payslipController.getAllPayslips);
router.post("/", checkAuth(UserRole.HR, UserRole.ADMIN), validateRequest(createPayslipSchema), payslipController.generatePayslip);
router.get("/:id", checkAuth(), payslipController.getPayslipById);
router.patch("/:id/approve", checkAuth(), payslipController.approvePayslip);
router.patch("/:id/mark-paid", checkAuth(), payslipController.markPaidPayslip);

export const payslipRoutes = router;