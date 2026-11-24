import mongoose from 'mongoose';
import { LEAVE_STATUS } from '../config/constants.js';

const leaveRequestSchema = new mongoose.Schema(
  {
    leaveId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Denormalized snapshots for blazing fast queries and historical audit
    studentName: { type: String, required: true },
    enrollmentNo: { type: String, required: true, index: true },
    department: { type: String, default: 'CSE' },
    semester: { type: String, default: '6th Semester' },
    roomNo: { type: String, required: true },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
    },
    detailedExplanation: {
      type: String,
      default: '',
    },
    destinationAddress: {
      type: String,
      required: [true, 'Destination address is required'],
    },
    destinationCity: {
      type: String,
      required: [true, 'Destination city is required'],
    },
    emergencyContact: {
      type: String,
      required: [true, 'Emergency contact is required'],
    },
    departureDate: {
      type: String,
      required: [true, 'Departure date is required'],
    },
    expectedReturnDate: {
      type: String,
      required: [true, 'Expected return date is required'],
      index: true,
    },
    actualExitTime: {
      type: String,
      default: null,
    },
    actualReturnTime: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(LEAVE_STATUS),
      default: LEAVE_STATUS.PENDING_PARENT_APPROVAL,
      index: true,
    },
    submittedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    parentActionAt: {
      type: String,
      default: null,
    },
    parentActionComment: {
      type: String,
      default: null,
    },
    wardenActionAt: {
      type: String,
      default: null,
    },
    wardenActionComment: {
      type: String,
      default: null,
    },
    guardExitScanAt: {
      type: String,
      default: null,
    },
    guardReturnScanAt: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    extension: {
      requestedDays: Number,
      newReturnDate: String,
      reason: String,
      status: {
        type: String,
        enum: ['NONE', 'EXTENSION_PENDING', 'EXTENSION_APPROVED', 'EXTENSION_REJECTED'],
        default: 'NONE',
      },
      submittedAt: String,
    },
  },
  {
    timestamps: true,
  }
);

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;
