import { Router } from 'express';
import { protect } from '../auth/auth.middleware.js';
import {
  getNotificationsController,
  markAllReadController,
  markOneReadController,
} from './notifications.controller.js';

const router = Router();

router.get('/', protect, getNotificationsController);
router.patch('/read-all', protect, markAllReadController);
router.patch('/:id/read', protect, markOneReadController);

export default router;
