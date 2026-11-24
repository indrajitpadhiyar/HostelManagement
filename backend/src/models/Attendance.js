import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    enrollmentNo: {
      type: String,
      required: true,
      index: true,
    },
    roomNo: {
      type: String,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'ON_LEAVE', 'LATE'],
      default: 'PRESENT',
      index: true,
    },
    session: {
      type: String,
      enum: ['NIGHT_ROLL_CALL', 'MORNING', 'SPECIAL'],
      default: 'NIGHT_ROLL_CALL',
    },
    markedAt: {
      type: String,
      default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    markedBy: {
      type: String,
      default: 'Warden Roll Call',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique record per student per date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
