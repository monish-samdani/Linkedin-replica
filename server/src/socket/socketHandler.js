import jwt from 'jsonwebtoken';
import User from '../features/auth/auth.model.js';
import Conversation from '../features/messages/conversation.model.js';

// In-memory presence registry: userId -> socketId. Single source of truth for "who is online".
const onlineUsers = new Map();

let ioRef = null;

export const isUserOnline = (userId) => onlineUsers.has(String(userId));

export const getSocketId = (userId) => onlineUsers.get(String(userId));

// Emit an event to a specific user if they currently have a connected socket.
export const emitToUser = (userId, event, payload) => {
  if (!ioRef) return;
  const socketId = onlineUsers.get(String(userId));
  if (socketId) ioRef.to(socketId).emit(event, payload);
};

const getOtherParticipant = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId).select('participants').lean();
  if (!conversation) return null;
  const other = conversation.participants.find((p) => String(p) !== String(userId));
  return other ? String(other) : null;
};

export const initSocketHandlers = (io) => {
  ioRef = io;

  // Authenticate the handshake with the same secret used by the HTTP protect middleware.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Not authorized, no token'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      return next();
    } catch {
      return next(new Error('Not authorized, invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const { userId } = socket;
    if (!userId) {
      socket.disconnect();
      return;
    }

    onlineUsers.set(String(userId), socket.id);
    io.emit('user:online', { userId: String(userId) });
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: Date.now() }).catch(() => {});

    socket.on('typing:start', async ({ conversationId }) => {
      const otherId = await getOtherParticipant(conversationId, userId);
      if (otherId) emitToUser(otherId, 'typing:start', { conversationId, userId: String(userId) });
    });

    socket.on('typing:stop', async ({ conversationId }) => {
      const otherId = await getOtherParticipant(conversationId, userId);
      if (otherId) emitToUser(otherId, 'typing:stop', { conversationId, userId: String(userId) });
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(String(userId));
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: Date.now() }).catch(() => {});
      io.emit('user:offline', { userId: String(userId) });
    });
  });
};
