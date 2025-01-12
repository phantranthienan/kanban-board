import express from 'express';
import { register, login, refreshToken, googleAuthRedirect, googleCallbackHandler } from '@/controllers/auth.controller';

const router = express.Router();

// Local authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Google authentication routes
router.get('/google/login', googleAuthRedirect);
router.get('/google/callback', googleCallbackHandler);

export default router;
