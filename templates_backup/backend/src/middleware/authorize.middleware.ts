import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { UserRole } from '../types/user.types.js';

export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                ApiError.forbidden('You do not have permission to perform this action')
            );
        }

        next();
    };
};

// Convenience middlewares for common role checks
export const adminOnly = authorize('admin');
export const moderatorOrAdmin = authorize('admin', 'moderator');
