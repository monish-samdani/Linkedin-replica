import jwt from 'jsonwebtoken';
import User from './auth.model.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw new AppError('Not authorized, no token', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Not authorized, invalid token', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('Not authorized, user not found', 401);

  req.user = user;
  next();
});
