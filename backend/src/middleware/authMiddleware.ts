import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';
import { config } from '../config';

interface JWTPayload {
    userId: string;
}

interface AuthRequest extends Request {
    user?: {
        id: string;
    }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Acess denied' });

    try {
        const decodedToken = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
        req.user = { id: decodedToken.userId };  
    } catch (error) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
};