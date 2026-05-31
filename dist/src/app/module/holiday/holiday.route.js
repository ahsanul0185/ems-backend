"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidayRoutes = void 0;
const express_1 = require("express");
const holiday_controller_1 = require("./holiday.controller");
// import auth from "../../middleware/auth";
// import { UserRole } from "../../../generated/prisma/client";
const router = (0, express_1.Router)();
// TODO: Add auth middleware when ready
// router.post("/", auth(UserRole.ADMIN, UserRole.HR), holidayController.createHoliday);
router.post("/", holiday_controller_1.holidayController.createHoliday);
router.get("/", holiday_controller_1.holidayController.getAllHolidays);
exports.holidayRoutes = router;
