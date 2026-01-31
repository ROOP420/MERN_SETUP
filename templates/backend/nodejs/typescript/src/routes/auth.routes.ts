import { Router } from 'express';
import {
    register,
    login,
    logout,
    refreshToken,
    getMe,
    verifyEmail,
    forgotPassword,
    resetPassword,
    googleAuth,
    googleAuthCallback,
    googleCallback,
    githubAuth,
    githubAuthCallback,
    githubCallback,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.middleware.js';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from '../schemas/auth.schema.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.get('/verify-email/:token', validate(verifyEmailSchema), verifyEmail);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

// OAuth routes - Google
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback, googleCallback);

// OAuth routes - GitHub
router.get('/github', githubAuth);
router.get('/github/callback', githubAuthCallback, githubCallback);

export default router;
