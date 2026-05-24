import { Router } from "express";
import { holidayController } from "./holiday.controller";
// import auth from "../../middleware/auth";
// import { UserRole } from "../../../generated/prisma/client";

const router = Router();

// TODO: Add auth middleware when ready
// router.post("/", auth(UserRole.ADMIN, UserRole.HR), holidayController.createHoliday);
router.post("/", holidayController.createHoliday);
router.get("/", holidayController.getAllHolidays);

export const holidayRoutes = router;
