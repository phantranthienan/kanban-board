import dotenv from 'dotenv';
dotenv.config();

const config = {
    PORT: process.env.PORT || 3000,
    CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','), 
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string, 
    MONGODB_URI:
        process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI_PROD as string
        : process.env.NODE_ENV === 'test'
        ? process.env.MONGODB_URI_TEST as string
        : process.env.MONGODB_URI_DEV as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI as string,
};

export default config;
