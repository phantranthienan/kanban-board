import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/config';

export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Access denied. No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
        req.user = { id: decoded.id };
        next();
    } catch (error: any) {
        const errorMessage =
            error.name === 'TokenExpiredError'
                ? 'Token expired'
                : error.name === 'JsonWebTokenError'
                ? 'Invalid token'
                : 'Failed to authenticate token';

        res.status(401).json({ message: errorMessage });
    }
};