import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { IUser, User } from '../models/userModel';
import { config } from '../config';

export const registerUser = async (userData: IUser): Promise<IUser> => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({...userData, password: hashedPassword});
    return user.save();
};

export const loginUser = async (username: string, password: string): Promise<string> => {
    const user = await User.findOne({ username });
    if (!user) throw new Error('Invalid username or password');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error('Invalid username or password');

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1d' });
    return token;
};