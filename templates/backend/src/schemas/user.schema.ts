import { z } from 'zod';

export const updateProfileSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name cannot exceed 100 characters')
            .trim()
            .optional(),
        avatar: z
            .string()
            .url('Invalid avatar URL')
            .optional(),
    }),
});

export const getUserByIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
    }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
