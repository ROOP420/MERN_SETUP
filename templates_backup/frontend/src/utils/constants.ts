export const APP_NAME = 'MERN App';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password/:token',
    VERIFY_EMAIL: '/verify-email/:token',
    AUTH_CALLBACK: '/auth/callback',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
} as const;

export const TOKEN_EXPIRY = {
    ACCESS: 15 * 60 * 1000, // 15 minutes
    REFRESH: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;
