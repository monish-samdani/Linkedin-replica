import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { getUserById } from './users.service.js';

export const getUserByIdController = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  return sendSuccess(res, { message: 'User fetched', data: { user } });
});
