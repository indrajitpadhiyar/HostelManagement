import mongoose from 'mongoose';

const guardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    guardId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      default: '',
    },
    gateNumber: {
      type: String,
      default: 'Main Gate 1',
    },
    shift: {
      type: String,
      default: 'Day Shift (06:00 AM - 02:00 PM)',
    },
    onDuty: {
      type: Boolean,
      default: true,
      index: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
  },
  {
    timestamps: true,
  }
);

export const Guard = mongoose.model('Guard', guardSchema);
export default Guard;
