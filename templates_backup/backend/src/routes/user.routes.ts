import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    getUserById,
    getAllUsers,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema, getUserByIdSchema, changePasswordSchema } from '../schemas/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/me', getProfile);
router.put('/me', validate(updateProfileSchema), updateProfile);
router.put('/me/password', validate(changePasswordSchema), changePassword);
router.delete('/me', deleteAccount);

// Admin routes
router.get('/', adminOnly, getAllUsers);
router.get('/:id', adminOnly, validate(getUserByIdSchema), getUserById);

export default router;
