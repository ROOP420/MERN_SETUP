import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

// General rate limiter
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
        next(ApiError.tooManyRequests('Too many requests, please try again later'));
    },
});

// Strict rate limiter for auth routes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
        next(ApiError.tooManyRequests('Too many authentication attempts, please try again later'));
    },
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    message: 'Too many password reset attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
        next(ApiError.tooManyRequests('Too many password reset attempts, please try again later'));
    },
});
