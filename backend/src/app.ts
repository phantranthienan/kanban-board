
//core modules
import express, {Express, Request, Response} from 'express';

//import async error handler
import 'express-async-errors';

//database connection
import mongoose from 'mongoose';
import { config } from './config';

//third party middlewares
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

//import error handler
import { errorHandler } from './middleware/errorHandler';

//import routes
import router from './routes';

//initialize express
const app: Express = express();

//connect to MongoDB
mongoose.set('strictQuery', false);

console.log(`Connecting to ${config.MONGODB_URI}`);

mongoose.connect(config.MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((error) => {
            console.error('Error connecting to MongoDB:', error.message);
        });

//middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

//routes
app.use('/api', router);

//unknown endpoint
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Unknow endpoint' });
});

//error handler
app.use(errorHandler);  

export default app;