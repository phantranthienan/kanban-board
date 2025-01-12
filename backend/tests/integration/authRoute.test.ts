import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { createUser, deleteAllUsers, getUserByEmail } from '../../src/models/user.model';
import { comparePassword, encryptPassword } from '../../src/utils/password';

describe('Auth Route', () => {
    beforeEach(async () => {
        await deleteAllUsers();
    });

    describe('POST api/auth/register', () => {
        it('should register a user successfully', async () => {
            const response = await request(app).post('/api/auth/register').send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password',
                confirmPassword: 'password',
            });

            expect(response.status).toBe(201);
            expect(response.body.username).toBe('testuser');
            expect(response.body.email).toBe('test@example.com');

            const user = await getUserByEmail('test@example.com');
            expect(user).toBeDefined();
            expect(user?.username).toBe('testuser');
            expect(await comparePassword('password', user?.password || '')).toBe(true);
        });

        it('should return 400 if email already exists', async () => {
            await createUser({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedPassword',
            });

            const response = await request(app).post('/api/auth/register').send({
                username: 'testuser2',
                email: 'test@example.com',
                password: 'password',
                confirmPassword: 'password',
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email already exists');
        });

        it('should return 400 if username already exists', async () => {
            await createUser({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedPassword',
            });

            const response = await request(app).post('/api/auth/register').send({
                username: 'testuser',
                email: 'test2@example.com',
                password: 'password',
                confirmPassword: 'password',
            });
            
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
            expect(response.body.refreshToken).toBeDefined(); // Ensure refresh token is returned
            expect(response.body.user.username).toBe('testuser');
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
            const refreshToken = jwt.sign({ id: 'user123' }, process.env.JWT_REFRESH_SECRET!, {
               expiresIn: '7d',
            });
          
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', [`refreshToken=${refreshToken}`]); // Send refresh token as cookie
          
            expect(response.status).toBe(200); // HTTP 200 OK
            expect(response.body.accessToken).toBeDefined(); // Ensure a new access token is returned
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