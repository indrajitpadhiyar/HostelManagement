import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    enrollmentNo: { type: String, required: true, index: true },
    roomNo: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'GATE_EXIT',
        'GATE_RETURN',
        'LEAVE_SUBMITTED',
        'PARENT_APPROVED',
        'PARENT_REJECTED',
        'WARDEN_APPROVED',
        'WARDEN_REJECTED',
        'EXTENSION_REQUESTED',
        'EXTENSION_APPROVED',
        'OVERDUE_ALERT',
        'ROOM_REALLOCATED',
      ],
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: {
      type: String,
      default: () => 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    badgeType: {
      type: String,
      enum: ['info', 'success', 'warning', 'danger'],
      default: 'info',
    },
    status: { type: String, default: 'INFO' },
  },
  {
    timestamps: true,
  }
);

export const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
