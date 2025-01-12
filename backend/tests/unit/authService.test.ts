import { register, login, googleLogin, refreshAccessToken } from '../../src/services/auth.service';
import { getUserByEmail, getUserByGoogleId, getUserByUsername, createUser } from '../../src/models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


jest.mock('../../src/models/user.model', () => ({
    getUserByEmail: jest.fn(),
    getUserByGoogleId: jest.fn(),
    getUserByUsername: jest.fn(),
    createUser: jest.fn(),
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        const mockUserData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password',
        };

        it('should register a new user', async () => { 
            (getUserByEmail as jest.Mock).mockResolvedValue(null);
            (getUserByUsername as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (createUser as jest.Mock).mockResolvedValue({ ...mockUserData, password: undefined });

            const user = await register(mockUserData);

            expect(getUserByEmail).toHaveBeenCalledWith(mockUserData.email);
            expect(getUserByUsername).toHaveBeenCalledWith(mockUserData.username);
            expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 12);
            expect(createUser).toHaveBeenCalledWith({ ...mockUserData, password: 'hashedPassword' });
            expect(user).toEqual({ ...mockUserData, password: undefined });
        });

        it('should throw an error if the email already exists', async () => {
            (getUserByEmail as jest.Mock).mockResolvedValue({ email: 'test@example.com' });
            await expect(register(mockUserData)).rejects.toThrow('Email already exists');
            expect(getUserByEmail).toHaveBeenCalledWith(mockUserData.email);
        });

        it('should throw an error if the username already exists', async () => {
            (getUserByEmail as jest.Mock).mockResolvedValue(null);
            (getUserByUsername as jest.Mock).mockResolvedValue({ username: 'testuser' });
            await expect(register(mockUserData))
                .rejects.toThrow('Username already exists');
            expect(getUserByEmail).toHaveBeenCalledWith(mockUserData.email);
            expect(getUserByUsername).toHaveBeenCalledWith(mockUserData.username);
        });
    });

    describe('login', () => {
        const mockUser = {
            _id: '1',
            username: 'testuser',
            email: 'test@example.com',
            password: 'hashedPassword',
        };

        it('should return tokens for valid credentials', async () => {
            (getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mockToken');

            const { accessToken, refreshToken, user } = await login('testuser', 'password');

            expect(getUserByUsername).toHaveBeenCalledWith('testuser');
            expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalledTimes(2);
            expect(accessToken).toBe('mockToken');
            expect(refreshToken).toBe('mockToken');
            expect(user).toEqual(mockUser);
        });

        it('should throw an error for invalid credentials', async () => {
            (getUserByUsername as jest.Mock).mockResolvedValue(null);
            await expect(login(mockUser.username, mockUser.password))
                .rejects.toThrow('Wrong username or password');
            expect(getUserByUsername).toHaveBeenCalledWith('testuser');
        });
    });

    describe('google login', () => {
        const mockGoogleUser = {
            _id: '1',
            googleId: 'google123',
            email: 'test@gmail.com',
        };
        it('should login an existing Google user', async () => {
            (getUserByGoogleId as jest.Mock).mockResolvedValue(mockGoogleUser);
            (jwt.sign as jest.Mock).mockReturnValue('mockToken');
            const { accessToken, refreshToken, user } = await googleLogin(mockGoogleUser.googleId, mockGoogleUser.email);
            expect(getUserByGoogleId).toHaveBeenCalledWith(mockGoogleUser.googleId);
            expect(jwt.sign).toHaveBeenCalledTimes(2);
            expect(accessToken).toBe('mockToken');
            expect(refreshToken).toBe('mockToken');
            expect(user).toEqual(mockGoogleUser);
        });
    });

    describe('refresh token', () => {
        it('should generate a new access token', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ id: '1' });
            (jwt.sign as jest.Mock).mockReturnValue('newAccessToken');

            const newAccessToken = await refreshAccessToken('validRefreshToken');

            expect(jwt.verify).toHaveBeenCalledWith('validRefreshToken', expect.any(String));
            expect(jwt.sign).toHaveBeenCalledWith({ id: '1' }, expect.any(String), { expiresIn: '15m' });
            expect(newAccessToken).toBe('newAccessToken');
        });

        it('should throw an error for an invalid refresh token', async () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(refreshAccessToken('invalidRefreshToken')).rejects.toThrow('Invalid or expired refresh token');
        });
    });
});