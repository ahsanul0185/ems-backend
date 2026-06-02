import { Router } from "express";
import { holidayController } from "./holiday.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", checkAuth(UserRole.ADMIN, UserRole.HR), holidayController.createHoliday);
router.get("/", checkAuth(), holidayController.getAllHolidays);

export const holidayRoutes = router;
