import { Router } from "express";
import { departmentController } from "./department.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { createDepartmentZodSchema, updateDepartmentZodSchema } from "./department.validation";

const router = Router();

router.get('/', checkAuth(UserRole.ADMIN, UserRole.HR), departmentController.getAllDepartments);
router.post('/create', checkAuth(UserRole.ADMIN, UserRole.HR), validateRequest(createDepartmentZodSchema), departmentController.createDepartment);
router.put('/update/:id', checkAuth(UserRole.ADMIN, UserRole.HR), validateRequest(updateDepartmentZodSchema), departmentController.updateDepartment);
router.delete('/delete/:id', checkAuth(UserRole.ADMIN, UserRole.HR), departmentController.deleteDepartment);

export const departmentRoutes = router;