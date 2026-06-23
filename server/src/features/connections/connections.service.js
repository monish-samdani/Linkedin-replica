import Connection from './connections.model.js';
import User from '../auth/auth.model.js';
import AppError from '../../utils/AppError.js';
import { createNotification } from '../notifications/notifications.service.js';

const POPULATE_FIELDS = 'name profilePhoto headline';

// Single source of truth for finding the connection between two users (either direction).
const getConnectionBetween = (userA, userB) =>
  Connection.findOne({
    $or: [
      { sender: userA, recipient: userB },
      { sender: userB, recipient: userA },
    ],
  });

// Pure status derivation from a connection document relative to the current user.
const deriveStatus = (connection, currentUserId) => {
  if (!connection || connection.status === 'rejected') return 'none';
  if (connection.status === 'accepted') return 'connected';
  return String(connection.sender) === String(currentUserId) ? 'pending_sent' : 'pending_received';
};

const getAcceptedPartnerIds = async (userId) => {
  const conns = await Connection.find({
    status: 'accepted',
    $or: [{ sender: userId }, { recipient: userId }],
  })
    .select('sender recipient')
    .lean();

  return conns.map((c) =>
    String(c.sender) === String(userId) ? String(c.recipient) : String(c.sender)
  );
};

export const getConnectionState = async (currentUserId, otherUserId) => {
  const connection = await getConnectionBetween(currentUserId, otherUserId);
  return {
    status: deriveStatus(connection, currentUserId),
    connectionId: connection?._id || null,
  };
};

// Spec-named helper — delegates to getConnectionState so logic lives in one place.
export const getConnectionStatus = async (currentUserId, otherUserId) => {
  const { status } = await getConnectionState(currentUserId, otherUserId);
  return status;
};

export const sendConnectionRequest = async (senderId, recipientId) => {
  if (String(senderId) === String(recipientId)) {
    throw new AppError('You cannot send a connection request to yourself', 400);
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) throw new AppError('User not found', 404);

  const existing = await getConnectionBetween(senderId, recipientId);
  if (existing) {
    if (existing.status === 'accepted') throw new AppError('You are already connected', 409);
    if (existing.status === 'pending') throw new AppError('A connection request already exists', 409);
    // A previously rejected request can be re-sent — clear it so the unique index allows a fresh one.
    await existing.deleteOne();
  }

  const connection = await Connection.create({ sender: senderId, recipient: recipientId });
  await createNotification(recipientId, senderId, 'connection_request', connection._id);

  return connection;
};

export const acceptConnectionRequest = async (requestId, currentUserId) => {
  const connection = await Connection.findById(requestId);
  if (!connection) throw new AppError('Connection request not found', 404);

  if (String(connection.recipient) !== String(currentUserId)) {
    throw new AppError('You are not authorized to accept this request', 403);
  }
  if (connection.status !== 'pending') {
    throw new AppError('This request is no longer pending', 400);
  }

  connection.status = 'accepted';
  await connection.save();

  await Promise.all([
    User.updateOne({ _id: connection.sender }, { $addToSet: { connections: connection.recipient } }),
    User.updateOne({ _id: connection.recipient }, { $addToSet: { connections: connection.sender } }),
  ]);

  // Notify the original sender that their request was accepted.
  await createNotification(connection.sender, connection.recipient, 'connection_accepted', connection._id);

  return connection;
};

export const rejectConnectionRequest = async (requestId, currentUserId) => {
  const connection = await Connection.findById(requestId);
  if (!connection) throw new AppError('Connection request not found', 404);

  if (String(connection.recipient) !== String(currentUserId)) {
    throw new AppError('You are not authorized to reject this request', 403);
  }
  if (connection.status !== 'pending') {
    throw new AppError('This request is no longer pending', 400);
  }

  connection.status = 'rejected';
  await connection.save();
  return connection;
};

export const removeConnection = async (connectionId, currentUserId) => {
  const connection = await Connection.findById(connectionId);
  if (!connection) throw new AppError('Connection not found', 404);

  const isParticipant =
    String(connection.sender) === String(currentUserId) ||
    String(connection.recipient) === String(currentUserId);
  if (!isParticipant) {
    throw new AppError('You are not authorized to remove this connection', 403);
  }

  await connection.deleteOne();

  await Promise.all([
    User.updateOne({ _id: connection.sender }, { $pull: { connections: connection.recipient } }),
    User.updateOne({ _id: connection.recipient }, { $pull: { connections: connection.sender } }),
  ]);

  return { id: connectionId };
};

export const getUserConnections = async (userId) => {
  return Connection.find({
    status: 'accepted',
    $or: [{ sender: userId }, { recipient: userId }],
  })
    .populate('sender', POPULATE_FIELDS)
    .populate('recipient', POPULATE_FIELDS)
    .sort({ updatedAt: -1 })
    .lean();
};

export const getPendingRequests = async (userId) => {
  return Connection.find({ status: 'pending', recipient: userId })
    .populate('sender', POPULATE_FIELDS)
    .sort({ createdAt: -1 })
    .lean();
};

export const getMutualConnections = async (userId1, userId2) => {
  const [ids1, ids2] = await Promise.all([
    getAcceptedPartnerIds(userId1),
    getAcceptedPartnerIds(userId2),
  ]);

  const set2 = new Set(ids2);
  const mutualIds = ids1.filter((id) => set2.has(id));
  if (mutualIds.length === 0) return [];

  return User.find({ _id: { $in: mutualIds } })
    .select('name profilePhoto')
    .lean();
};
