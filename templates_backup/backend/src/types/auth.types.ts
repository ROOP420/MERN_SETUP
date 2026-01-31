import { Request, Response, NextFunction, RequestHandler } from 'express';
import { IUser } from './user.types.js';

// Use Express's global augmentation for Request.user
// Instead of extending Request, we use a type for handlers that expect authenticated users
export interface AuthRequest extends Request {
    user?: IUser;
}

export interface TokenPayload {
    userId: string;
    type: 'access' | 'refresh';
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface OAuthProfile {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    provider: 'google' | 'github';
}

// Type helper for auth handlers
export type AuthHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void> | void;
