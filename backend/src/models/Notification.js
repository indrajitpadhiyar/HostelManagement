import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../config/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    role: {
      type: String,
      enum: ['student', 'parent', 'warden', 'guard', 'all'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      default: NOTIFICATION_TYPES.SYSTEM,
    },
    requestId: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    time: {
      type: String,
      default: () => 'Just now',
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
