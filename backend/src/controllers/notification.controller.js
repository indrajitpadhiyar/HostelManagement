import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { Notification } from '../models/Notification.js';

/**
 * @desc    Get notifications for authenticated user
 * @route   GET /api/v1/notifications
 * @access  Private (All authenticated roles)
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const user = req.user;

  // Match either specific userId or matching role or 'all'
  const filter = {
    $or: [{ userId: user._id }, { role: user.role }, { role: 'all' }],
  };

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    ...filter,
    read: false,
  });

  return res.status(200).json(
    ApiResponse.success(
      {
        unreadCount,
        notifications,
      },
      'Notifications retrieved successfully'
    )
  );
});

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.read = true;
  await notification.save();

  return res.status(200).json(ApiResponse.success(notification, 'Notification marked as read'));
});

/**
 * @desc    Mark all user notifications as read
 * @route   PATCH /api/v1/notifications/mark-all-read
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const user = req.user;

  const filter = {
    $or: [{ userId: user._id }, { role: user.role }, { role: 'all' }],
    read: false,
  };

  const result = await Notification.updateMany(filter, { $set: { read: true } });

  return res.status(200).json(
    ApiResponse.success(
      { modifiedCount: result.modifiedCount },
      'All notifications marked as read'
    )
  );
});
