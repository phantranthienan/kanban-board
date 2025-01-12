import { Request, Response } from 'express';
import { registerSchema, loginSchema } from '@/utils/validators/authSchema';
import * as authService from '@/services/auth.service';
import { CustomError } from '@/errors';

/**
 * Register a new user.
 */
export const register = async (req: Request, res: Response) => {
    registerSchema.parse(req.body);
    const { username, email, password } = req.body;
    const user = await authService.register({ username, email, password });
    res.status(201).json(user);
};


/**
 * Login an existing user.
 */
export const login = async (req: Request, res: Response) => {
    loginSchema.parse(req.body);
    const { username, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(username, password);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ accessToken, user });
};

/**
 * Refresh access token.
 */
export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        throw new CustomError('Refresh token not provided', 401);
    }

    const newAccessToken = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ newAccessToken });
};


/**
 * Redirect to Google Consent Screen
 */
export const googleAuthRedirect = (_req: Request, res: Response) => {
    const url = authService.getGoogleAuthUrl();
    res.redirect(url);
};

/**
 * Handle Google OAuth2 Callback
*/
export const googleCallbackHandler = async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) throw new CustomError('Authorization code is required', 400);
    const { accessToken, refreshToken, user } = await authService.handleGoogleCallback(code as string);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({ accessToken, user });
};