import { Request, Response } from 'express';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UpdateProfileInput, ChangePasswordInput } from '../schemas/index.js';

// Helper to sanitize user object
const sanitizeUser = (user: { _id: unknown; email: string; name: string; avatar?: string; role: string; isEmailVerified: boolean; authProvider: string; createdAt?: Date }) => ({
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
    }

    res.json(
        new ApiResponse(200, 'Profile retrieved successfully', {
            user: sanitizeUser(req.user),
        })
    );
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
    }

    const { name, avatar } = req.body as UpdateProfileInput;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            ...(name && { name }),
            ...(avatar && { avatar }),
        },
        { new: true, runValidators: true }
    );

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    res.json(
        new ApiResponse(200, 'Profile updated successfully', {
            user: sanitizeUser(user),
        })
    );
});

/**
 * @desc    Change password
 * @route   PUT /api/users/me/password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
    }

    const { currentPassword, newPassword } = req.body as ChangePasswordInput;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Check if using OAuth account without password
    if (!user.password && user.authProvider !== 'local') {
        throw ApiError.badRequest('Cannot change password for OAuth accounts');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
        throw ApiError.badRequest('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json(new ApiResponse(200, 'Password changed successfully'));
});

/**
 * @desc    Delete current user account
 * @route   DELETE /api/users/me
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
    }

    await User.findByIdAndDelete(req.user._id);

    res.json(new ApiResponse(200, 'Account deleted successfully'));
});

/**
 * @desc    Get user by ID (admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    res.json(
        new ApiResponse(200, 'User retrieved successfully', {
            user: sanitizeUser(user),
        })
    );
});

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(),
    ]);

    res.json(
        new ApiResponse(200, 'Users retrieved successfully', {
            users: users.map(sanitizeUser),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    );
});
