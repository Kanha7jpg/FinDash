import { Router } from 'express';
import { z } from 'zod';
import {
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), registerController);
authRouter.post('/login', validateBody(loginSchema), loginController);
authRouter.post('/refresh', refreshController);
authRouter.post('/logout', logoutController);
authRouter.get('/me', authMiddleware, meController);
