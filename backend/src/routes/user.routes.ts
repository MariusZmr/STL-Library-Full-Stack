import { Router } from 'express';
import { getAllUsers, updateUserRole, deleteUser, getMe } from '../controllers/user.controller';
import { authMiddleware, managerMiddleware } from '../middleware/auth.middleware';

const router = Router();

// @route   GET /api/users/me
// @desc    Get current authenticated user's details
// @access  Private (Auth required)
router.get('/me', authMiddleware, getMe);

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Auth and Manager/Admin role required)
router.get('/', authMiddleware, managerMiddleware, getAllUsers);

// @route   PUT /api/users/:id/role
// @desc    Update a user's role
// @access  Private (Auth and Manager/Admin role required)
router.put('/:id/role', authMiddleware, managerMiddleware, updateUserRole);

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private (Auth and Manager/Admin role required)
router.delete('/:id', authMiddleware, managerMiddleware, deleteUser);

export default router;
