import 'express-async-errors';
import express, { Express, Response } from 'express';
import mongoose from 'mongoose';
import config from './config';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from '@/middleware/error.middleware';
import { notFoundHandler } from '@/middleware/notFound.middleware';
import router from '@/routes';

const app: Express = express();

// MongoDB Connection
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error connecting to MongoDB:', error.message);
        }
        setTimeout(connectToMongoDB, 5000);
    }
};
connectToMongoDB();

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await mongoose.disconnect();
    process.exit(0);
});


const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            // Allow any origin in development or test environments
            callback(null, true);
        } else if (!origin || config.CORS_ORIGINS.includes(origin)) {
            // Allow specific origins in production
            callback(null, true);
        } else {
            // Block other origins in production
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies and credentials
};

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per window
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Routes
app.use('/api', router);
app.use('/api/health', (_, res: Response) => {
    res.json({ message: 'Server is healthy' });
});

// 404 and Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
