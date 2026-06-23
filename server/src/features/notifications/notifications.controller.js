import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { getNotifications, markAllRead, markOneRead } from './notifications.service.js';

export const getNotificationsController = asyncHandler(async (req, res) => {
  const notifications = await getNotifications(req.user._id);
  return sendSuccess(res, { message: 'Notifications fetched', data: { notifications } });
});

export const markAllReadController = asyncHandler(async (req, res) => {
  await markAllRead(req.user._id);
  return sendSuccess(res, { message: 'All notifications marked as read' });
});

export const markOneReadController = asyncHandler(async (req, res) => {
  const notification = await markOneRead(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Notification marked as read', data: { notification } });
});
