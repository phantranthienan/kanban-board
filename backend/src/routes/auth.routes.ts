import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/refresh-token', authController.refreshToken);

export default router;
