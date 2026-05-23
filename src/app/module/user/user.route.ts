import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import { updateUserSchema } from "./user.validation";

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/update/:id', validateRequest(updateUserSchema), userController.updateUser);
router.delete('/delete/:id', userController.deleteUser);

export const userRoutes = router;