import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';

export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('Access token is required');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw ApiError.unauthorized('Access token is required');
        }

        // Verify token
        const payload = TokenService.verifyAccessToken(token);

        if (!payload) {
            throw ApiError.unauthorized('Invalid or expired access token');
        }

        // Get user from database
        const user = await User.findById(payload.userId);

        if (!user) {
            throw ApiError.unauthorized('User not found');
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

// Optional authentication - doesn't throw if no token
export const optionalAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const payload = TokenService.verifyAccessToken(token);

        if (payload) {
            const user = await User.findById(payload.userId);
            if (user) {
                req.user = user;
            }
        }

        next();
    } catch {
        // Silently continue without user
        next();
    }
};
