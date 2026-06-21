import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { getUserById, searchUsers } from './users.service.js';

export const searchUsersController = asyncHandler(async (req, res) => {
  const users = await searchUsers(req.query.q);
  return sendSuccess(res, { message: 'Users fetched', data: { users } });
});

export const getUserByIdController = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  return sendSuccess(res, { message: 'User fetched', data: { user } });
});
