import { Router } from 'express';
import { protect } from '../auth/auth.middleware.js';
import { searchUsersController, getUserByIdController } from './users.controller.js';

const router = Router();

router.get('/search', protect, searchUsersController);
router.get('/:id', protect, getUserByIdController);

export default router;
