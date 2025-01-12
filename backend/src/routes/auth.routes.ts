import express from 'express';
import { register, login, refreshToken, googleLogin } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/refresh-token', refreshToken);

router.post('/goole-login', googleLogin)

export default router;
