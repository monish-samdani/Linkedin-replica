import Conversation from './conversation.model.js';
import Message from './message.model.js';
import User from '../auth/auth.model.js';
import Connection from '../connections/connections.model.js';
import AppError from '../../utils/AppError.js';
import { getConnectionStatus } from '../connections/connections.service.js';
import { emitToUser, isUserOnline } from '../../socket/socketHandler.js';

const PARTICIPANT_FIELDS = 'name profilePhoto headline';

const pairKey = (a, b) => [String(a), String(b)].sort().join('_');

const isParticipant = (conversation, userId) =>
  conversation.participants.some((p) => String(p._id || p) === String(userId));

const otherParticipantId = (conversation, userId) =>
  conversation.participants.find((p) => String(p._id || p) !== String(userId));

const countUnread = (conversationId, userId) =>
  Message.countDocuments({
    conversationId,
    sender: { $ne: userId },
    status: { $ne: 'read' },
    deletedBy: { $ne: userId },
  });

// Marks the other participant's messages as read and, if anything changed, notifies the
// sender in real-time so their sent-message ticks can turn blue.
const markMessagesRead = async (conversationId, userId, otherId) => {
  const result = await Message.updateMany(
    { conversationId, sender: { $ne: userId }, status: { $ne: 'read' } },
    { status: 'read' }
  );
  if (result.modifiedCount > 0 && otherId) {
    emitToUser(otherId, 'message:status', { conversationId: String(conversationId), status: 'read' });
  }
};

// Returns a single conversation enriched with the other participant + the viewer's unread count.
const buildConversationView = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId)
    .populate('participants', PARTICIPANT_FIELDS)
    .populate('lastMessage')
    .lean();
  if (!conversation) throw new AppError('Conversation not found', 404);

  const other = conversation.participants.find((p) => String(p._id) !== String(userId)) || null;
  const unreadCount = await countUnread(conversation._id, userId);
  return { ...conversation, otherParticipant: other, unreadCount };
};

export const getConversations = async (userId, { archived = false } = {}) => {
  const filter = {
    participants: userId,
    deletedBy: { $ne: userId },
    archivedBy: archived ? userId : { $ne: userId },
  };

  const conversations = await Conversation.find(filter)
    .populate('participants', PARTICIPANT_FIELDS)
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .lean();

  return Promise.all(
    conversations.map(async (c) => {
      const other = c.participants.find((p) => String(p._id) !== String(userId)) || null;
      const unreadCount = await countUnread(c._id, userId);
      return { ...c, otherParticipant: other, unreadCount };
    })
  );
};

export const startConversation = async (currentUserId, recipientId) => {
  if (String(currentUserId) === String(recipientId)) {
    throw new AppError('You cannot start a conversation with yourself', 400);
  }

  const [currentUser, recipient] = await Promise.all([
    User.findById(currentUserId).select('blockedUsers'),
    User.findById(recipientId).select('blockedUsers'),
  ]);
  if (!recipient) throw new AppError('User not found', 404);

  const key = pairKey(currentUserId, recipientId);
  const existing = await Conversation.findOne({ participantsKey: key });

  // Fast path: existing conversation. Block check first (single doc read).
  if (existing) {
    if (existing.isBlocked) throw new AppError('This conversation is blocked', 403);
    // Reopening a previously soft-deleted conversation restores it for the current user.
    if (existing.deletedBy?.some((id) => String(id) === String(currentUserId))) {
      existing.deletedBy = existing.deletedBy.filter((id) => String(id) !== String(currentUserId));
      await existing.save();
    }
    return buildConversationView(existing._id, currentUserId);
  }

  // No conversation yet — fall back to user-level block check before creating.
  const blockedEitherWay =
    currentUser?.blockedUsers?.some((id) => String(id) === String(recipientId)) ||
    recipient.blockedUsers?.some((id) => String(id) === String(currentUserId));
  if (blockedEitherWay) {
    throw new AppError('You cannot start a conversation with this user', 403);
  }

  const status = await getConnectionStatus(currentUserId, recipientId);
  const created = await Conversation.create({
    participants: [currentUserId, recipientId],
    isStrangerConversation: status !== 'connected',
  });

  return buildConversationView(created._id, currentUserId);
};

export const getMessages = async (conversationId, userId, { page = 1, limit = 30 } = {}) => {
  const conversation = await Conversation.findById(conversationId)
    .populate('participants', PARTICIPANT_FIELDS)
    .lean();
  if (!conversation) throw new AppError('Conversation not found', 404);
  if (!isParticipant(conversation, userId)) {
    throw new AppError('You are not a participant in this conversation', 403);
  }

  const safeLimit = Math.min(Number(limit) || 30, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  // Fetch newest-first for efficient pagination, then reverse so the client renders oldest→newest.
  const docs = await Message.find({ conversationId, deletedBy: { $ne: userId } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit)
    .lean();

  const other = conversation.participants.find((p) => String(p._id) !== String(userId)) || null;

  // Opening a conversation marks the other participant's messages as read (and notifies them).
  await markMessagesRead(conversationId, userId, other?._id);

  return {
    conversation: { ...conversation, otherParticipant: other, unreadCount: 0 },
    messages: docs.reverse(),
    page: safePage,
    hasMore: docs.length === safeLimit,
  };
};

export const sendMessage = async (conversationId, senderId, content) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new AppError('Conversation not found', 404);
  if (!isParticipant(conversation, senderId)) {
    throw new AppError('You are not a participant in this conversation', 403);
  }

  // Fast block check on the conversation doc before doing anything else.
  if (conversation.isBlocked) throw new AppError('This conversation is blocked', 403);

  // Keep the stranger flag accurate in case the two users connected since creation.
  const otherId = otherParticipantId(conversation, senderId);
  const connStatus = await getConnectionStatus(senderId, otherId);
  conversation.isStrangerConversation = connStatus !== 'connected';

  // 'delivered' if the recipient currently has a live socket, otherwise 'sent' (polling fallback).
  const recipientOnline = isUserOnline(otherId);
  const message = await Message.create({
    conversationId,
    sender: senderId,
    content,
    status: recipientOnline ? 'delivered' : 'sent',
  });
  conversation.lastMessage = message._id;
  await conversation.save();

  // Push to the recipient in real-time; offline recipients will pick it up on their next poll.
  if (recipientOnline) {
    emitToUser(otherId, 'message:new', message.toObject());
  }

  return message;
};

export const markConversationRead = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new AppError('Conversation not found', 404);
  if (!isParticipant(conversation, userId)) {
    throw new AppError('You are not a participant in this conversation', 403);
  }

  const otherId = otherParticipantId(conversation, userId);
  await markMessagesRead(conversationId, userId, otherId);
  return { success: true };
};

export const toggleArchive = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new AppError('Conversation not found', 404);
  if (!isParticipant(conversation, userId)) {
    throw new AppError('You are not a participant in this conversation', 403);
  }

  const archived = conversation.archivedBy.some((id) => String(id) === String(userId));
  if (archived) {
    conversation.archivedBy.pull(userId);
  } else {
    conversation.archivedBy.push(userId);
  }
  await conversation.save();
  return { archived: !archived };
};

export const deleteConversation = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new AppError('Conversation not found', 404);
  if (!isParticipant(conversation, userId)) {
    throw new AppError('You are not a participant in this conversation', 403);
  }

  if (!conversation.deletedBy.some((id) => String(id) === String(userId))) {
    conversation.deletedBy.push(userId);
    await conversation.save();
  }
  return { id: conversationId };
};

export const markConnectionRequestSent = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new AppError('Conversation not found', 404);
  if (!isParticipant(conversation, userId)) {
    throw new AppError('You are not a participant in this conversation', 403);
  }

  conversation.connectionRequestSent = true;
  await conversation.save();
  return buildConversationView(conversation._id, userId);
};

export const blockUser = async (currentUserId, targetUserId) => {
  if (String(currentUserId) === String(targetUserId)) {
    throw new AppError('You cannot block yourself', 400);
  }
  const target = await User.findById(targetUserId);
  if (!target) throw new AppError('User not found', 404);

  await Promise.all([
    // Block + sever the connection on the current user's side.
    User.updateOne(
      { _id: currentUserId },
      { $addToSet: { blockedUsers: targetUserId }, $pull: { connections: targetUserId } }
    ),
    User.updateOne({ _id: targetUserId }, { $pull: { connections: currentUserId } }),
    // Remove all connection docs between them (pending + accepted) so status stays consistent.
    Connection.deleteMany({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
    }),
    Conversation.updateOne(
      { participantsKey: pairKey(currentUserId, targetUserId) },
      { isBlocked: true, blockedBy: currentUserId }
    ),
  ]);

  return { blocked: true };
};

export const unblockUser = async (currentUserId, targetUserId) => {
  const target = await User.findById(targetUserId);
  if (!target) throw new AppError('User not found', 404);

  await Promise.all([
    User.updateOne({ _id: currentUserId }, { $pull: { blockedUsers: targetUserId } }),
    // Only lift the block on a conversation that this user actually blocked.
    Conversation.updateOne(
      { participantsKey: pairKey(currentUserId, targetUserId), blockedBy: currentUserId },
      { isBlocked: false, blockedBy: null }
    ),
  ]);

  return { blocked: false };
};

export const getBlockedUsers = async (userId) => {
  const user = await User.findById(userId)
    .populate('blockedUsers', PARTICIPANT_FIELDS)
    .lean();
  if (!user) throw new AppError('User not found', 404);
  return user.blockedUsers || [];
};
