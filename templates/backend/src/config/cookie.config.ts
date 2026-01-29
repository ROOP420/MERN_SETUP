import { CookieOptions } from 'express';
import { env } from './env.config.js';

const isProduction = env.NODE_ENV === 'production';

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
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
