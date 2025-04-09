import express from 'express';
import { getUserById, updateUser } from '../controllers/userController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/:id', getUserById);

// Protected routes
router.put('/:id', protect, updateUser);

export default router;