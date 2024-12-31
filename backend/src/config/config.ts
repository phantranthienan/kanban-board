import dotenv from 'dotenv';
dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI_PROD as string : process.env.MONGODB_URI_DEV as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
}