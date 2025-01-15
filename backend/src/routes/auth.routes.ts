import express from 'express';
import { register, login, getAccessToken, googleAuthRedirect, googleCallbackHandler, logout, getMyInfo } from '@/controllers/auth.controller';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = express.Router();

// Local authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout)
router.get('/access-token', getAccessToken);
router.get('/me', authMiddleware, getMyInfo);

// Google authentication routes
router.get('/google/login', googleAuthRedirect);
router.get('/google/callback', googleCallbackHandler);

export default router;
