import { Router } from 'express';
import { protect } from '../auth/auth.middleware.js';
import { getUserByIdController } from './users.controller.js';

const router = Router();

router.get('/:id', protect, getUserByIdController);

export default router;
