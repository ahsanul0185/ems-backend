import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createUserZodSchema, loginUserZodSchema } from './auth.validation';


const router = Router();

router.post('/login', validateRequest(loginUserZodSchema), authController.loginUser);
router.post('/create', validateRequest(createUserZodSchema), authController.createUser);


export const authRoutes = router;