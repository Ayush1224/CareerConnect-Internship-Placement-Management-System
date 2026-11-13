import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

const notificationFields = '_id title message type isRead interviewId createdAt';

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .select(notificationFields)
      .sort({ createdAt: -1 });
    const unreadCount = notifications.reduce((count, item) => count + (item.isRead ? 0 : 1), 0);
    return res.status(200).json({
      success: true,
      data: { notifications, unreadCount }
    });
  } catch (error) {
    return next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isRead: true } },
      { new: true, runValidators: true }
    ).select(notificationFields);
    if (!notification) return next(new ApiError(404, 'Notification not found'));
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification, unreadCount }
    });
  } catch (error) {
    return next(error);
  }
};
