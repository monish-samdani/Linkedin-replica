import { findUserById } from '../auth/auth.service.js';

export const getUserById = async (userId) => {
  return findUserById(userId);
};
