import { Router } from 'express';
import { protect } from '../auth/auth.middleware.js';
import {
  sendRequestController,
  acceptRequestController,
  rejectRequestController,
  removeConnectionController,
  getStatusController,
  getMyConnectionsController,
  getRequestsController,
  getMutualController,
} from './connections.controller.js';

const router = Router();

router.post('/request/:recipientId', protect, sendRequestController);
router.patch('/accept/:requestId', protect, acceptRequestController);
router.patch('/reject/:requestId', protect, rejectRequestController);
router.get('/status/:otherUserId', protect, getStatusController);
router.get('/my', protect, getMyConnectionsController);
router.get('/requests', protect, getRequestsController);
router.get('/mutual/:otherUserId', protect, getMutualController);
router.delete('/:connectionId', protect, removeConnectionController);

export default router;
