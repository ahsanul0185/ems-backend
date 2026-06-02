import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";
import { updateUserSchema, createHRProfileSchema } from "./user.validation";

const router = Router();

router.get('/', checkAuth(UserRole.ADMIN), userController.getAllUsers);
router.get('/:id', checkAuth(UserRole.ADMIN), userController.getUserById);
router.put('/update/:id', checkAuth(UserRole.ADMIN), validateRequest(updateUserSchema), userController.updateUser);
router.delete('/delete/:id', checkAuth(UserRole.ADMIN), userController.deleteUser);

router.post('/hr-profile/create', checkAuth(UserRole.ADMIN), validateRequest(createHRProfileSchema), userController.createHRProfile);

export const userRoutes = router;