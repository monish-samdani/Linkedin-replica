import User from '../auth/auth.model.js';
import { findUserById } from '../auth/auth.service.js';
import { getConnectionState } from '../connections/connections.service.js';

export const getUserById = async (userId) => {
  return findUserById(userId);
};

export const getAllUsers = async (currentUserId) => {
  const filter = currentUserId ? { _id: { $ne: currentUserId } } : {};
  return User.find(filter).select('name profilePhoto headline').limit(50).lean();
};

export const searchUsers = async (query, currentUserId) => {
  const term = query?.trim();
  if (!term) return [];

  // Escape regex special characters so user input is treated as a literal.
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

  const filter = { $or: [{ name: regex }, { email: regex }] };
  if (currentUserId) filter._id = { $ne: currentUserId };

  const users = await User.find(filter)
    .select('name email headline profilePhoto')
    .limit(10)
    .lean();

  if (!currentUserId) {
    return users.map((u) => ({ ...u, connectionStatus: 'none', connectionId: null }));
  }

  // Attach the viewer's connection status so the UI can render the right button inline.
  return Promise.all(
    users.map(async (u) => {
      const { status, connectionId } = await getConnectionState(currentUserId, u._id);
      return { ...u, connectionStatus: status, connectionId };
    })
  );
};
