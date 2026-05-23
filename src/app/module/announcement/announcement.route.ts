import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { announcementController } from "./announcement.controller";
import { createAnnouncementSchema, updateAnnouncementSchema } from "./announcement.validation";

const router = Router();

router.get("/", checkAuth(), announcementController.getAllAnnouncements);
router.post("/", checkAuth(UserRole.HR, UserRole.ADMIN), validateRequest(createAnnouncementSchema), announcementController.createAnnouncement);
router.get("/:id", checkAuth(), announcementController.getAnnouncementById);
router.put("/:id", checkAuth(UserRole.HR, UserRole.ADMIN), validateRequest(updateAnnouncementSchema), announcementController.updateAnnouncement);
router.delete("/:id", checkAuth(UserRole.HR, UserRole.ADMIN), announcementController.deleteAnnouncement);
router.put("/:id/publish", checkAuth(UserRole.HR, UserRole.ADMIN), announcementController.publishAnnouncement);

export const announcementRoutes = router;