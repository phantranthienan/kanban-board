import express from 'express';
import { body } from 'express-validator';

import * as userController from '../controllers/userController';
 
const router = express.Router();

router.post(
    '/register', 
    [
        body('username')
            .isString()
            .notEmpty().withMessage('Username is required')
            .isLength({ max: 20 }).withMessage('Username must be at most 20 characters long'),
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isString()
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
            .matches(/[0-9]/).withMessage('Password must contain a number')
            .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    ],
    userController.register);
router.post('/login', userController.login);

export default router;