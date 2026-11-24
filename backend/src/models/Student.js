import mongoose from 'mongoose';
import { HOSTEL_STATUS } from '../config/constants.js';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    enrollmentNo: {
      type: String,
      required: [true, 'Enrollment number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    roomNo: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
      index: true,
    },
    block: {
      type: String,
      default: 'Block A',
    },
    floor: {
      type: String,
      default: '2nd Floor',
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
    },
    deptCode: {
      type: String,
      default: 'CSE',
      index: true,
    },
    semester: {
      type: String,
      default: '6th Semester',
    },
    year: {
      type: String,
      default: '3rd Year',
    },
    hostelStatus: {
      type: String,
      enum: Object.values(HOSTEL_STATUS),
      default: HOSTEL_STATUS.PRESENT,
      index: true,
    },
    parentName: {
      type: String,
      default: 'Parent / Guardian',
    },
    parentEmail: {
      type: String,
      lowercase: true,
      default: 'parent@hosteleasy.demo',
    },
    parentMobile: {
      type: String,
      default: '+91 98765 43211',
    },
    parentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    academicHistory: [
      {
        year: String,
        semester: String,
        gpa: String,
        attendance: String,
        roomNo: String,
        department: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.model('Student', studentSchema);
export default Student;
