import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  markConversationRead,
  toggleArchive,
  deleteConversation,
  markConnectionRequestSent,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from './messages.service.js';

export const getConversationsController = asyncHandler(async (req, res) => {
  const conversations = await getConversations(req.user._id, { archived: false });
  return sendSuccess(res, { message: 'Conversations fetched', data: { conversations } });
});

export const getArchivedConversationsController = asyncHandler(async (req, res) => {
  const conversations = await getConversations(req.user._id, { archived: true });
  return sendSuccess(res, { message: 'Archived conversations fetched', data: { conversations } });
});

export const startConversationController = asyncHandler(async (req, res) => {
  const conversation = await startConversation(req.user._id, req.body.recipientId);
  return sendSuccess(res, { message: 'Conversation ready', data: { conversation } });
});

export const getMessagesController = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await getMessages(req.params.id, req.user._id, { page, limit });
  return sendSuccess(res, { message: 'Messages fetched', data });
});

export const sendMessageController = asyncHandler(async (req, res) => {
  const message = await sendMessage(req.params.id, req.user._id, req.body.content);
  return sendSuccess(res, { message: 'Message sent', data: { message }, statusCode: 201 });
});

export const markReadController = asyncHandler(async (req, res) => {
  const result = await markConversationRead(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Conversation marked as read', data: result });
});

export const toggleArchiveController = asyncHandler(async (req, res) => {
  const result = await toggleArchive(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Conversation archive toggled', data: result });
});

export const deleteConversationController = asyncHandler(async (req, res) => {
  const result = await deleteConversation(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Conversation deleted', data: result });
});

export const markConnectionRequestSentController = asyncHandler(async (req, res) => {
  const conversation = await markConnectionRequestSent(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Connection request flagged', data: { conversation } });
});

export const blockUserController = asyncHandler(async (req, res) => {
  const result = await blockUser(req.user._id, req.params.userId);
  return sendSuccess(res, { message: 'User blocked', data: result });
});

export const unblockUserController = asyncHandler(async (req, res) => {
  const result = await unblockUser(req.user._id, req.params.userId);
  return sendSuccess(res, { message: 'User unblocked', data: result });
});

export const getBlockedUsersController = asyncHandler(async (req, res) => {
  const blockedUsers = await getBlockedUsers(req.user._id);
  return sendSuccess(res, { message: 'Blocked users fetched', data: { blockedUsers } });
});
