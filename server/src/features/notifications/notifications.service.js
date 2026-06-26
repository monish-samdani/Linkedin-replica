import Notification from './notifications.model.js';
import AppError from '../../utils/AppError.js';

export const createNotification = async (recipientId, senderId, type, connectionId = null, jobId = null) => {
  // Never notify a user about their own action.
  if (String(recipientId) === String(senderId)) return null;

  return Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    connectionId,
    jobId,
  });
};

export const getNotifications = async (userId) => {
  return Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .populate('sender', 'name profilePhoto')
    .lean();
};

export const markAllRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, read: false }, { read: true });
  return { success: true };
};

export const markOneRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );

  if (!notification) throw new AppError('Notification not found', 404);
  return notification;
};
