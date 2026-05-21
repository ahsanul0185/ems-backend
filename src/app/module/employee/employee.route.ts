import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { employeeController } from './employee.controller';
import { createEmployeeZodSchema } from './employee.validation';

const router = Router();

router.get('/', employeeController.getAllEmployees);
router.post('/create', validateRequest(createEmployeeZodSchema), employeeController.createEmployee);

export const employeeRoutes = router;