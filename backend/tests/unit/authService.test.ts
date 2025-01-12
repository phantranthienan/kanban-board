import { register, login, refreshAccessToken, handleGoogleCallback } from '@/services/auth.service';
import { getUserByEmail, getUserByGoogleId, getUserByUsername, createUser } from '@/models/user.model';
import { encryptPassword, comparePassword } from '@/utils/password.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/token.util';
import { getTokenInfo } from '@/utils/googleAuth.util';

jest.mock('@/models/user.model', () => ({
    getUserByEmail: jest.fn(),
    getUserByGoogleId: jest.fn(),
    getUserByUsername: jest.fn(),
    createUser: jest.fn(),
}));

jest.mock('@/utils/password.util', () => ({
    encryptPassword: jest.fn(),
    comparePassword: jest.fn(),
}));

jest.mock('@/utils/token.util', () => ({
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
}));

jest.mock('@/utils/googleAuth.util', () => ({
    getTokenInfo: jest.fn(),
}));

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
            (encryptPassword as jest.Mock).mockResolvedValue('hashedPassword');
            (createUser as jest.Mock).mockResolvedValue({ ...mockUserData, password: undefined });

            const user = await register(mockUserData);

            expect(getUserByEmail).toHaveBeenCalledWith(mockUserData.email);
            expect(getUserByUsername).toHaveBeenCalledWith(mockUserData.username);
            expect(encryptPassword).toHaveBeenCalledWith(mockUserData.password);
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

        it('should log in a user successfully', async () => {
            (getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
            (comparePassword as jest.Mock).mockResolvedValue(true);
            (generateAccessToken as jest.Mock).mockReturnValue('accessToken');
            (generateRefreshToken as jest.Mock).mockReturnValue('refreshToken');

            const result = await login(mockUser.username, 'password123');

            expect(getUserByUsername).toHaveBeenCalledWith(mockUser.username);
            expect(comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(generateAccessToken).toHaveBeenCalledWith(mockUser._id);
            expect(generateRefreshToken).toHaveBeenCalledWith(mockUser._id);
            expect(result).toEqual({
                accessToken: 'accessToken',
                refreshToken: 'refreshToken',
                user: mockUser,
            });
        });

        it('should throw an error for invalid credentials', async () => {
            (getUserByUsername as jest.Mock).mockResolvedValue(null);
            await expect(login(mockUser.username, mockUser.password))
                .rejects.toThrow('Wrong username or password');
            expect(getUserByUsername).toHaveBeenCalledWith('testuser');
        });
    });

    describe('handleGoogleCallback', () => {
        const mockGoogleData = {
            id: 'google123',
            email: 'google@example.com',
            name: 'Google User',
        };

        const mockUser = {
            _id: '1',
            googleId: 'google123',
            email: 'google@example.com',
        };

        it('should log in an existing Google user', async () => {
            (getTokenInfo as jest.Mock).mockResolvedValue({ tokens: "googleTokens", userInfo: mockGoogleData });
            (getUserByGoogleId as jest.Mock).mockResolvedValue(mockUser);
            (generateAccessToken as jest.Mock).mockReturnValue('accessToken');
            (generateRefreshToken as jest.Mock).mockReturnValue('refreshToken');

            const result = await handleGoogleCallback('authCode123');

            expect(getTokenInfo).toHaveBeenCalledWith('authCode123');
            expect(getUserByGoogleId).toHaveBeenCalledWith('google123');
            expect(generateAccessToken).toHaveBeenCalledWith(mockUser._id);
            expect(result).toEqual({
                accessToken: 'accessToken',
                refreshToken: 'refreshToken',
                user: mockUser,
            });
        });

        it('should register a new Google user if not found', async () => {
            (getTokenInfo as jest.Mock).mockResolvedValue({ userInfo: mockGoogleData });
            (getUserByGoogleId as jest.Mock).mockResolvedValue(null);
            (createUser as jest.Mock).mockResolvedValue(mockUser);

            const result = await handleGoogleCallback('authCode123');

            expect(createUser).toHaveBeenCalledWith({
                googleId: 'google123',
                email: 'google@example.com',
                username: 'Google User',
                provider: 'google',
            });
            expect(result.user).toEqual(mockUser);
        });
    });


    describe('refresh access token', () => {
        it('should generate a new access token', async () => {
            (verifyRefreshToken as jest.Mock).mockReturnValue({ id: '1' });
            (generateAccessToken as jest.Mock).mockReturnValue('newAccessToken');

            const newAccessToken = await refreshAccessToken('validRefreshToken');

            expect(verifyRefreshToken).toHaveBeenCalledWith('validRefreshToken');
            expect(generateAccessToken).toHaveBeenCalledWith('1');
            expect(newAccessToken).toBe('newAccessToken');
        });

        it('should throw an error for an invalid refresh token', async () => {
            (verifyRefreshToken as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(refreshAccessToken('invalidRefreshToken')).rejects.toThrow('Invalid or expired refresh token');
        });
    });
});