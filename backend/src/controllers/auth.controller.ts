import { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../utils/zodSchemas';
import * as authService from '../services/auth.service';
import { CustomError } from '../errors';

/**
 * Register a new user.
 */
export const register = async (req: Request, res: Response) => {
    registerSchema.parse(req.body);
    const { username, email, password } = req.body;
    const user = await authService.registerUser({ username, email, password });
    res.status(201).json(user);
};

/**
 * Login an existing user.
 */
export const login = async (req: Request, res: Response) => {
    loginSchema.parse(req.body);
    const { username, password } = req.body;
    const { token, refreshToken, user } = await authService.loginUser(username, password);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ token, user });
};

/**
 * Refresh access token.
 */
export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        throw new CustomError('Refresh token not provided', 401);
    }

    const newToken = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ token: newToken });
};
