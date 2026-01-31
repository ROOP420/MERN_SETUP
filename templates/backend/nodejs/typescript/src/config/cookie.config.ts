import { CookieOptions } from 'express';
import { env } from './env.config.js';

const isProduction = env.NODE_ENV === 'production';

// For cross-origin requests in development, sameSite must be 'none'
// but 'none' requires secure:true, which requires HTTPS
// In development without HTTPS, we use 'lax' and rely on proxy OR
// we set sameSite to false to omit the attribute entirely
export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction, // Only require HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    // In development, ensure the cookie is accessible
};

export const accessTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
};

export const COOKIE_NAMES = {
    REFRESH_TOKEN: 'refreshToken',
    ACCESS_TOKEN: 'accessToken',
} as const;
