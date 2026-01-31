import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: 'Email is required' })
            .email('Invalid email format')
            .toLowerCase()
            .trim(),
        password: z
            .string({ required_error: 'Password is required' })
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            ),
        name: z
            .string({ required_error: 'Name is required' })
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name cannot exceed 100 characters')
            .trim(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: 'Email is required' })
            .email('Invalid email format')
            .toLowerCase()
            .trim(),
        password: z
            .string({ required_error: 'Password is required' })
            .min(1, 'Password is required'),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: 'Email is required' })
            .email('Invalid email format')
            .toLowerCase()
            .trim(),
    }),
});

export const resetPasswordSchema = z.object({
    params: z.object({
        token: z.string({ required_error: 'Reset token is required' }),
    }),
    body: z.object({
        password: z
            .string({ required_error: 'Password is required' })
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            ),
        confirmPassword: z.string({ required_error: 'Confirm password is required' }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    }),
});

export const verifyEmailSchema = z.object({
    params: z.object({
        token: z.string({ required_error: 'Verification token is required' }),
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z
            .string({ required_error: 'Current password is required' })
            .min(1, 'Current password is required'),
        newPassword: z
            .string({ required_error: 'New password is required' })
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            ),
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
