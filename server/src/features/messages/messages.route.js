import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../../middleware/validate.js';
import { protect } from '../auth/auth.middleware.js';
import {
  getConversationsController,
  getArchivedConversationsController,
  startConversationController,
  getMessagesController,
  sendMessageController,
  markReadController,
  toggleArchiveController,
  deleteConversationController,
  markConnectionRequestSentController,
  blockUserController,
  unblockUserController,
  getBlockedUsersController,
} from './messages.controller.js';

const router = Router();

const startConversationValidation = [
  body('recipientId').notEmpty().withMessage('recipientId is required').isMongoId().withMessage('Invalid recipientId'),
];

const sendMessageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
];

// Static routes must precede the "/conversations/:id" param route so they are not shadowed.
router.get('/conversations/archived', protect, getArchivedConversationsController);
router.get('/conversations', protect, getConversationsController);
router.post('/conversations', protect, startConversationValidation, validate, startConversationController);
router.get('/conversations/:id', protect, getMessagesController);
router.post('/conversations/:id/message', protect, sendMessageValidation, validate, sendMessageController);
router.patch('/conversations/:id/read', protect, markReadController);
router.patch('/conversations/:id/archive', protect, toggleArchiveController);
router.patch('/conversations/:id/connection-request', protect, markConnectionRequestSentController);
router.delete('/conversations/:id', protect, deleteConversationController);

router.patch('/block/:userId', protect, blockUserController);
router.patch('/unblock/:userId', protect, unblockUserController);
router.get('/blocked', protect, getBlockedUsersController);

export default router;
