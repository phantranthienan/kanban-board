import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { IUser, User } from '../models/userModel';
import { CustomError } from '../errors/CustomError';
import { config } from '../config';

export const registerUser = async (userData: IUser): Promise<IUser> => {
    const existingUser = await User.findOne({ username: userData.username });
    if (existingUser) {
        throw new CustomError('Username already exists', 400);
    };
    
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
        throw new CustomError('Email already exists', 400);
    };

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({...userData, password: hashedPassword});
    return user.save();
};

export const loginUser = async (username: string, password: string): Promise<string> => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new CustomError('Invalid username or password', 401);
    };

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new CustomError('Invalid username or password', 401);
    };

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1d' });
    return token;
};