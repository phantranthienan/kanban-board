import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../utils/zodSchemas';
import { AuthRequest } from '../middleware/authMiddleware';
import { CustomError } from '../errors/CustomError';

import * as authService from '../services/authService';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    registerSchema.parse(req.body);
    const { username, email, password } = req.body;
    const user = await authService.registerUser({ username, email, password });
    res.status(201).json(user);
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const token = await authService.loginUser(req.body.username, req.body.password);
    res.status(200).json({ token });
};

export const getUserInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
        return next(new CustomError('User not found', 404));
    }
    const user = await authService.getUserInfo(userId);
    res.status(200).json(user);
};