import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env, configurePassport } from './config/index.js';
import { errorHandler, notFoundHandler, generalLimiter } from './middleware/index.js';
import routes from './routes/index.js';

const app: Application = express();

// CORS configuration - MUST be before helmet
const corsOptions = {
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));

// Security middleware - configure to not block CORS
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'unsafe-none' },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing
app.use(cookieParser(env.COOKIE_SECRET));

// Rate limiting
app.use(generalLimiter);

// Passport initialization
app.use(passport.initialize());
configurePassport();

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
