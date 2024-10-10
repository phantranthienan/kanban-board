import { Request, Response, NextFunction } from 'express';

import * as userService from '../services/userService';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.registerUser(req.body);
    res.status(201).json(user);
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const token = await userService.loginUser(req.body.username, req.body.password);
    res.status(200).json({ token });
};