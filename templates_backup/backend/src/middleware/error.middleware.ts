import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.config.js';

interface ErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    errors?: unknown[];
    stack?: string;
}

export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Ensure CORS headers are set on error responses
    const origin = req.headers.origin;
    if (origin === env.CLIENT_URL) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    let error = err;

    // Log error in development (but skip 401s - they're expected for unauthenticated users)
    const errStatusCode = err instanceof ApiError ? err.statusCode : 500;
    if (env.NODE_ENV === 'development' && errStatusCode !== 401) {
        console.error('❌ Error:', err);
    }

    // Handle specific error types
    if (err.name === 'CastError') {
        error = ApiError.badRequest('Invalid ID format');
    }

    if (err.name === 'ValidationError') {
        error = ApiError.badRequest('Validation error');
    }

    if (err.name === 'MongoServerError' && (err as unknown as { code: number }).code === 11000) {
        const field = Object.keys((err as unknown as { keyValue: Record<string, unknown> }).keyValue)[0];
        error = ApiError.conflict(`${field} already exists`);
    }

    if (err.name === 'JsonWebTokenError') {
        error = ApiError.unauthorized('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        error = ApiError.unauthorized('Token expired');
    }

    // Default to 500 if not an ApiError
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof ApiError ? error.message : 'Internal server error';
    const errors = error instanceof ApiError ? error.errors : [];

    const response: ErrorResponse = {
        success: false,
        statusCode,
        message,
        errors: errors.length > 0 ? errors : undefined,
        stack: env.NODE_ENV === 'development' ? error.stack : undefined,
    };

    res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};
