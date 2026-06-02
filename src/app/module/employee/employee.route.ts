import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { checkAuth } from '../../middleware/checkAuth';
import { UserRole } from '../../../generated/prisma/enums';
import { employeeController } from './employee.controller';
import { createEmployeeZodSchema, updateEmployeeZodSchema } from './employee.validation';

const router = Router();

router.get('/', checkAuth(UserRole.ADMIN, UserRole.HR), employeeController.getAllEmployees);
router.get('/:id', checkAuth(UserRole.ADMIN, UserRole.HR), employeeController.getEmployeeById);
router.post('/create', checkAuth(UserRole.ADMIN, UserRole.HR), validateRequest(createEmployeeZodSchema), employeeController.createEmployee);
router.put('/update/:id', checkAuth(UserRole.ADMIN, UserRole.HR), validateRequest(updateEmployeeZodSchema), employeeController.updateEmployee);
router.delete('/delete/:id', checkAuth(UserRole.ADMIN, UserRole.HR), employeeController.deleteEmployee);

export const employeeRoutes = router;