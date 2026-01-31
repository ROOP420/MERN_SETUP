import { Request, Response } from 'express';
import crypto from 'crypto';
import passport from 'passport';
import { User } from '../models/User.model.js';
import { TokenService, emailService } from '../services/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env, refreshTokenCookieOptions, COOKIE_NAMES } from '../config/index.js';
import {
    RegisterInput,
    LoginInput,
    ForgotPasswordInput,
    ResetPasswordInput,
} from '../schemas/auth.schema.js';

// Helper to sanitize user object
const sanitizeUser = (user: { _id: unknown; email: string; name: string; avatar?: string; role: string; isEmailVerified: boolean; authProvider: string }) => ({
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    authProvider: user.authProvider,
});

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body as RegisterInput;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw ApiError.conflict('User with this email already exists');
    }

    // Create user
    const user = await User.create({
        email,
        password,
        name,
        authProvider: 'local',
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);

    // Generate tokens
    const tokens = await TokenService.generateTokens(
        user._id,
        req.headers['user-agent'],
        req.ip || undefined
    );

    // Set refresh token in cookie
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, refreshTokenCookieOptions);

    res.status(201).json(
        new ApiResponse(201, 'Registration successful. Please verify your email.', {
            user: sanitizeUser(user),
            accessToken: tokens.accessToken,
        })
    );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if using OAuth account
    if (!user.password && user.authProvider !== 'local') {
        throw ApiError.badRequest(`Please login using ${user.authProvider}`);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = await TokenService.generateTokens(
        user._id,
        req.headers['user-agent'],
        req.ip || undefined
    );

    // Set refresh token in cookie
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, refreshTokenCookieOptions);

    res.json(
        new ApiResponse(200, 'Login successful', {
            user: sanitizeUser(user),
            accessToken: tokens.accessToken,
        })
    );
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

    if (refreshToken) {
        await TokenService.revokeRefreshToken(refreshToken);
    }

    // Clear cookie
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });

    res.json(new ApiResponse(200, 'Logged out successfully'));
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

    if (!oldRefreshToken) {
        throw ApiError.unauthorized('Refresh token not found');
    }

    // Find and validate refresh token
    const tokenDoc = await TokenService.findRefreshToken(oldRefreshToken);

    if (!tokenDoc || !tokenDoc.user) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Rotate tokens
    const tokens = await TokenService.rotateRefreshToken(
        oldRefreshToken,
        tokenDoc.user._id,
        req.headers['user-agent'],
        req.ip || undefined
    );

    // Set new refresh token in cookie
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, refreshTokenCookieOptions);

    res.json(
        new ApiResponse(200, 'Token refreshed successfully', {
            accessToken: tokens.accessToken,
        })
    );
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
    }

    res.json(
        new ApiResponse(200, 'User retrieved successfully', {
            user: sanitizeUser(req.user),
        })
    );
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const tokenParam = req.params.token;
    const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

    if (!token) {
        throw ApiError.badRequest('Verification token is required');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
        throw ApiError.badRequest('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    res.json(new ApiResponse(200, 'Email verified successfully'));
});

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as ForgotPasswordInput;

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
        res.json(new ApiResponse(200, 'If an account exists, a password reset email has been sent'));
        return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    res.json(new ApiResponse(200, 'If an account exists, a password reset email has been sent'));
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const tokenParam = req.params.token;
    const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
    const { password } = req.body as ResetPasswordInput;

    if (!token) {
        throw ApiError.badRequest('Reset token is required');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
        throw ApiError.badRequest('Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    // Revoke all refresh tokens
    await TokenService.revokeAllUserTokens(user._id);

    res.json(new ApiResponse(200, 'Password reset successful. Please login with your new password.'));
});

/**
 * @desc    Google OAuth callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw ApiError.unauthorized('Authentication failed');
    }

    // Generate tokens
    const tokens = await TokenService.generateTokens(
        req.user._id,
        req.headers['user-agent'],
        req.ip || undefined
    );

    // Set refresh token in cookie
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, refreshTokenCookieOptions);

    // Redirect to frontend with access token
    res.redirect(`${env.CLIENT_URL}/auth/callback?token=${tokens.accessToken}`);
});

/**
 * @desc    GitHub OAuth callback
 * @route   GET /api/auth/github/callback
 * @access  Public
 */
export const githubCallback = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw ApiError.unauthorized('Authentication failed');
    }

    // Generate tokens
    const tokens = await TokenService.generateTokens(
        req.user._id,
        req.headers['user-agent'],
        req.ip || undefined
    );

    // Set refresh token in cookie
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, refreshTokenCookieOptions);

    // Redirect to frontend with access token
    res.redirect(`${env.CLIENT_URL}/auth/callback?token=${tokens.accessToken}`);
});

// Passport authentication handlers
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
});

export const googleAuthCallback = passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
});

export const githubAuth = passport.authenticate('github', {
    scope: ['user:email'],
});

export const githubAuthCallback = passport.authenticate('github', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
});
