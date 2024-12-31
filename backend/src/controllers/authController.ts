import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../utils/zodSchemas';
import { AuthRequest } from '../middleware/authMiddleware';
import { CustomError } from '../errors/CustomError';
import * as authService from '../services/authService';

/**
 * Register a new user.
 * Validates the input using the `registerSchema`, creates a new user, and returns the user details.
 * @route POST /auth/register
 * @param {Request} req - Express request object containing username, email, and password in the body.
 * @param {Response} res - Express response object.
 */
export const register = async (req: Request, res: Response) => {
    registerSchema.parse(req.body); // Validate input
    const { username, email, password } = req.body; // Extract data from the request body
    const user = await authService.registerUser({ username, email, password }); // Register the user
    res.status(201).json(user); // Respond with the created user
};

/**
 * Login an existing user.
 * Validates the input using the `loginSchema`, authenticates the user, and returns a JWT token.
 * @route POST /auth/login
 * @param {Request} req - Express request object containing username and password in the body.
 * @param {Response} res - Express response object.
 */
export const login = async (req: Request, res: Response) => {
    loginSchema.parse(req.body); // Validate input
    const { token, user } = await authService.loginUser(req.body.username, req.body.password); // Authenticate the user
    res.status(200).json({ token, user }); // Respond with the token
};

/**
 * Get the currently authenticated user's information.
 * Extracts the user ID from the `authMiddleware`, fetches user details, and returns them.
 * @route GET /auth/me
 * @param {AuthRequest} req - Express request object with the authenticated user's details.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function for error handling.
 */
export const getUserInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // Extract user ID from the authenticated request
    if (!userId) {
        return next(new CustomError('User not found', 404)); // Handle missing user
    }
    const user = await authService.getUserInfo(userId); // Fetch user info
    res.status(200).json(user); // Respond with the user object
};
