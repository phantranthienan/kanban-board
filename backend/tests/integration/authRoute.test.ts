import request from 'supertest';
import app from '@/app';
import { createUser, deleteAllUsers, getUserByEmail } from '@/models/user.model';
import { comparePassword, encryptPassword } from '@/utils/password.util';
import { generateRefreshToken } from '@/utils/token.util';

describe('Auth Route', () => {
    beforeEach(async () => {
        await deleteAllUsers();
    });
    const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
    };
    describe('POST api/auth/register', () => {
        it('should register a user successfully', async () => {
            const response = await request(app).post('/api/auth/register').send(registerData);

            expect(response.status).toBe(201);
            expect(response.body.username).toBe('testuser');
            expect(response.body.email).toBe('test@example.com');

            const user = await getUserByEmail('test@example.com');
            expect(user).toBeDefined();
            expect(user?.username).toBe('testuser');
            expect(await comparePassword('password123', user?.password || '')).toBe(true);
        });

        it('should return 400 if email already exists', async () => {
            await createUser({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedPassword',
            });

            const response = await request(app).post('/api/auth/register').send({...registerData, username: 'testuser2'});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email already exists');
        });

        it('should return 400 if username already exists', async () => {
            await createUser({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedPassword',
            });

            const response = await request(app).post('/api/auth/register').send({...registerData, email: 'test2@example.com'});
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Username already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should log in a user successfully', async () => {
            // Pre-create a user with a hashed password
            const hashedPassword = await encryptPassword('password123');
            await createUser({
              username: 'testuser',
              email: 'test@example.com',
              password: hashedPassword,
            });
        
            const response = await request(app).post('/api/auth/login').send({
              username: 'testuser',
              password: 'password123',
            });
        
            expect(response.status).toBe(200); // HTTP 200 OK
            expect(response.body.accessToken).toBeDefined(); // Ensure access token is returned
            expect(response.body.user.username).toBe('testuser');

            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();
            const cookiesArray = cookies[0].split(';');
            const refreshTokenCookie = cookiesArray.find((cookie: string) => cookie.trim().startsWith('refreshToken='));
            expect(refreshTokenCookie).toBeDefined();
        });

        it('should return 401 for incorrect password', async () => {
            // Pre-create a user with a hashed password
            const hashedPassword = await encryptPassword('password123');
            await createUser({
              username: 'testuser',
              email: 'test@example.com',
              password: hashedPassword,
            });
      
            const response = await request(app).post('/api/auth/login').send({
              username: 'testuser',
              password: 'wrongpassword',
            });
      
            expect(response.status).toBe(401); // HTTP 401 Unauthorized
            expect(response.body.message).toBe('Wrong username or password');
        });
      
        it('should return 401 if user does not exist', async () => {
            const response = await request(app).post('/api/auth/login').send({
              username: 'nonexistentuser',
              password: 'password123',
            });
      
            expect(response.status).toBe(401); // HTTP 401 Unauthorized
            expect(response.body.message).toBe('Wrong username or password');
        });
    });

    describe('POST /api/auth/refresh-token', () => {
        it('should refresh the access token successfully', async () => {
          // Generate a refresh token for a fake user
            const refreshToken = generateRefreshToken('user123');
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', [`refreshToken=${refreshToken}`]); // Send refresh token as cookie
          
            expect(response.status).toBe(200); // HTTP 200 OK
            expect(response.body.newAccessToken).toBeDefined(); // Ensure a new access token is returned
        });

        it('should return 401 if refresh token is not provided in cookies', async () => {
            const response = await request(app).post('/api/auth/refresh-token');

            expect(response.status).toBe(401); // HTTP 401 Unauthorized
            expect(response.body.message).toBe('Refresh token not provided');
        });
    
        it('should return 401 for an invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', ['refreshToken=invalidToken']); // Send an invalid token
            
            expect(response.status).toBe(401); // HTTP 401 Unauthorized
            expect(response.body.message).toBe('Invalid or expired refresh token');
        });
    });    
});