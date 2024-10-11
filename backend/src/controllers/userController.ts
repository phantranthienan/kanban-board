import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import * as userService from '../services/userService';

import { ValidationError } from '../errors/ValidationError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ValidationError(errors.array()));
    };

    const user = await userService.registerUser(req.body);
    res.status(201).json(user);
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ValidationError(errors.array()));
    };
    
    const token = await userService.loginUser(req.body.username, req.body.password);
    res.status(200).json({ token });
};