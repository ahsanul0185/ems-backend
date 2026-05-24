import { Router } from 'express';
import { authController } from './auth.controller';
import { checkAuth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { changePasswordZodSchema, createUserZodSchema, loginUserZodSchema } from './auth.validation';
import { UserRole } from '../../../generated/prisma/enums';


const router = Router();

router.post('/login', validateRequest(loginUserZodSchema), authController.loginUser);
router.post('/register', checkAuth(UserRole.ADMIN), validateRequest(createUserZodSchema), authController.createUser);
router.get('/me', checkAuth(), authController.getMe);
router.post('/refresh-token', authController.getNewToken);
router.post('/change-password', checkAuth(), validateRequest(changePasswordZodSchema), authController.changePassword);
router.post('/logout', authController.logoutUser);

export const authRoutes = router;