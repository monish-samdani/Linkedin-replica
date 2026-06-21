import User from '../auth/auth.model.js';
import { findUserById } from '../auth/auth.service.js';

export const getUserById = async (userId) => {
  return findUserById(userId);
};

export const searchUsers = async (query) => {
  const term = query?.trim();
  if (!term) return [];

  // Escape regex special characters so user input is treated as a literal.
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

  return User.find({ $or: [{ name: regex }, { email: regex }] })
    .select('name email headline profilePhoto')
    .limit(10)
    .lean();
};
