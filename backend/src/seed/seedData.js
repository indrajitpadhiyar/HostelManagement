import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Room } from '../models/Room.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';
import { Guard } from '../models/Guard.js';
import { Attendance } from '../models/Attendance.js';
import { ROLES, LEAVE_STATUS, HOSTEL_STATUS, NOTIFICATION_TYPES } from '../config/constants.js';

async function seed() {
  console.log('🌱 Starting HostelEase Enterprise Database Seeder...');
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('\n❌ Seeding aborted: Could not connect to MongoDB Atlas.');
    console.error('👉 Please whitelist your IP (106.202.121.121) or add 0.0.0.0/0 in MongoDB Atlas > Network Access.');
    console.error('   Then re-run: npm run seed\n');
    process.exit(1);
  }

  try {
    // Clean existing collections for atomic deterministic seed
    console.log('🧹 Purging existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Room.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
      Guard.deleteMany({}),
      Attendance.deleteMany({}),
    ]);

    console.log('👤 Seeding Enterprise Role Users...');
    // 1. Seed Users (password: "Password@123")
    const password = 'Password@123';

    const [studentUser, parentUser, wardenUser, guardUser] = await Promise.all([
      User.create({
        name: 'Aarav Sharma',
        email: 'student@hosteleasy.demo',
        mobile: '9876543210',
        role: ROLES.STUDENT,
        password,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      }),
      User.create({
        name: 'Rajesh Sharma',
        email: 'parent@hosteleasy.demo',
        mobile: '9876543211',
        role: ROLES.PARENT,
        password,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      }),
      User.create({
        name: 'Dr. Vijay K. Singh',
        email: 'warden@hosteleasy.demo',
        mobile: '9876543212',
        role: ROLES.WARDEN,
        password,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      }),
      User.create({
        name: 'Ramesh Guard',
        email: 'guard@hosteleasy.demo',
        mobile: '9876543213',
        role: ROLES.GUARD,
        password,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      }),
    ]);

    console.log('🏢 Seeding Hostel Rooms...');
    // 2. Seed Rooms
    const rooms = await Room.insertMany([
      { roomNo: 'A-204', block: 'Block A', floor: '2nd Floor', type: 'Double Occupancy (AC)', capacity: 2, studentIds: [] },
      { roomNo: 'A-101', block: 'Block A', floor: '1st Floor', type: 'Double Occupancy (AC)', capacity: 2, studentIds: [] },
      { roomNo: 'A-102', block: 'Block A', floor: '1st Floor', type: 'Double Occupancy', capacity: 2, studentIds: [] },
      { roomNo: 'A-201', block: 'Block A', floor: '2nd Floor', type: 'Double Occupancy', capacity: 2, studentIds: [] },
      { roomNo: 'A-301', block: 'Block A', floor: '3rd Floor', type: 'Single Premium', capacity: 1, studentIds: [] },
      { roomNo: 'B-101', block: 'Block B', floor: '1st Floor', type: 'Double Occupancy', capacity: 2, studentIds: [] },
      { roomNo: 'B-102', block: 'Block B', floor: '1st Floor', type: 'Double Occupancy', capacity: 2, studentIds: [] },
      { roomNo: 'B-201', block: 'Block B', floor: '2nd Floor', type: 'Triple Non-AC', capacity: 3, studentIds: [] },
    ]);

    console.log('🎓 Seeding Students...');
    // 3. Seed Students
    const student1 = await Student.create({
      userId: studentUser._id,
      enrollmentNo: 'EN2022001',
      name: 'Aarav Sharma',
      email: 'student@hosteleasy.demo',
      phone: '9876543210',
      roomNo: 'A-204',
      block: 'Block A',
      floor: '2nd Floor',
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      year: '3rd Year (Semester 6)',
      gender: 'Male',
      bloodGroup: 'B+',
      hostelStatus: HOSTEL_STATUS.PRESENT,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      parentDetails: {
        parentId: parentUser._id,
        name: 'Rajesh Sharma',
        relation: 'Father',
        phone: '9876543211',
        email: 'parent@hosteleasy.demo',
        occupation: 'Senior Engineer',
        address: '142, Malviya Nagar, Jaipur, Rajasthan 302017',
      },
    });

    const otherStudents = await Student.insertMany([
      {
        enrollmentNo: 'EN2022045',
        name: 'Rohan Verma',
        email: 'rohan.v@hosteleasy.demo',
        phone: '9876543220',
        roomNo: 'A-101',
        block: 'Block A',
        floor: '1st Floor',
        department: 'Electronics & Communication',
        course: 'B.Tech ECE',
        year: '2nd Year',
        gender: 'Male',
        bloodGroup: 'O+',
        hostelStatus: HOSTEL_STATUS.OUTSIDE,
        parentDetails: {
          name: 'Mukesh Verma',
          relation: 'Father',
          phone: '9876543221',
          address: 'Delhi NCR',
        },
      },
      {
        enrollmentNo: 'EN2022078',
        name: 'Priya Patel',
        email: 'priya.p@hosteleasy.demo',
        phone: '9876543230',
        roomNo: 'B-101',
        block: 'Block B',
        floor: '1st Floor',
        department: 'Information Technology',
        course: 'B.Tech IT',
        year: '3rd Year',
        gender: 'Female',
        bloodGroup: 'A+',
        hostelStatus: HOSTEL_STATUS.PRESENT,
        parentDetails: {
          name: 'Nitin Patel',
          relation: 'Father',
          phone: '9876543231',
          address: 'Ahmedabad, Gujarat',
        },
      },
      {
        enrollmentNo: 'EN2022112',
        name: 'Vikram Singh',
        email: 'vikram.s@hosteleasy.demo',
        phone: '9876543240',
        roomNo: 'A-201',
        block: 'Block A',
        floor: '2nd Floor',
        department: 'Mechanical Engineering',
        course: 'B.Tech ME',
        year: '4th Year',
        gender: 'Male',
        bloodGroup: 'AB+',
        hostelStatus: HOSTEL_STATUS.PRESENT,
        parentDetails: {
          name: 'Devendra Singh',
          relation: 'Father',
          phone: '9876543241',
          address: 'Kota, Rajasthan',
        },
      },
      {
        enrollmentNo: 'EN2022156',
        name: 'Ananya Gupta',
        email: 'ananya.g@hosteleasy.demo',
        phone: '9876543250',
        roomNo: 'B-102',
        block: 'Block B',
        floor: '1st Floor',
        department: 'Computer Science & Engineering',
        course: 'B.Tech CSE',
        year: '1st Year',
        gender: 'Female',
        bloodGroup: 'O-',
        hostelStatus: HOSTEL_STATUS.PRESENT,
        parentDetails: {
          name: 'Sanjay Gupta',
          relation: 'Father',
          phone: '9876543251',
          address: 'Indore, MP',
        },
      },
    ]);

    // Link students into rooms
    await Room.updateOne({ roomNo: 'A-204' }, { $addToSet: { studentIds: student1._id } });
    await Room.updateOne({ roomNo: 'A-101' }, { $addToSet: { studentIds: otherStudents[0]._id } });
    await Room.updateOne({ roomNo: 'B-101' }, { $addToSet: { studentIds: otherStudents[1]._id } });
    await Room.updateOne({ roomNo: 'A-201' }, { $addToSet: { studentIds: otherStudents[2]._id } });
    await Room.updateOne({ roomNo: 'B-102' }, { $addToSet: { studentIds: otherStudents[3]._id } });

    // Refresh Room counts
    const allRooms = await Room.find();
    for (const r of allRooms) {
      await r.save();
    }

    console.log('🛡️ Seeding Security Guards...');
    // 4. Seed Guards
    await Guard.insertMany([
      {
        userId: guardUser._id,
        guardId: 'GRD-101',
        name: 'Ramesh Guard',
        mobile: '9876543213',
        gateNumber: 'Main Gate 1',
        shift: 'Day Shift (06:00 AM - 02:00 PM)',
        onDuty: true,
      },
      {
        guardId: 'GRD-102',
        name: 'Suresh Yadav',
        mobile: '9876543288',
        gateNumber: 'Gate 2 (West Wing)',
        shift: 'Afternoon Shift (02:00 PM - 10:00 PM)',
        onDuty: true,
      },
      {
        guardId: 'GRD-103',
        name: 'Rajesh Verma',
        mobile: '9876543299',
        gateNumber: 'Main Gate 1',
        shift: 'Night Shift (10:00 PM - 06:00 AM)',
        onDuty: false,
      },
    ]);

    console.log('📝 Seeding Comprehensive Leave Requests...');
    // 5. Seed Leave Requests
    await LeaveRequest.insertMany([
      // Request 1: Pending Parent Approval
      {
        passId: 'LP-2026-1001',
        studentId: student1._id,
        leaveType: 'Home Visit',
        startDate: '2026-11-25',
        endDate: '2026-11-29',
        expectedReturnDate: '2026-11-29',
        departureTime: '10:00 AM',
        returnTime: '06:00 PM',
        destinationCity: 'Jaipur, Rajasthan',
        destinationAddress: '142, Malviya Nagar, Jaipur',
        reason: 'Family Function & Sister Wedding Ceremony',
        emergencyContact: '9876543211',
        modeOfTravel: 'Train',
        status: LEAVE_STATUS.PENDING_PARENT_APPROVAL,
      },
      // Request 2: Parent Approved, Pending Warden Approval
      {
        passId: 'LP-2026-1002',
        studentId: otherStudents[2]._id,
        leaveType: 'Academic / Conference',
        startDate: '2026-11-26',
        endDate: '2026-11-28',
        expectedReturnDate: '2026-11-28',
        departureTime: '08:30 AM',
        returnTime: '07:00 PM',
        destinationCity: 'Delhi',
        destinationAddress: 'IIT Delhi Campus',
        reason: 'National Robotics Hackathon 2026',
        emergencyContact: '9876543241',
        modeOfTravel: 'Bus',
        status: LEAVE_STATUS.PARENT_APPROVED,
        parentApproval: {
          approved: true,
          actionTimestamp: new Date(),
          remarks: 'Approved by father for educational competition.',
        },
      },
      // Request 3: Warden Approved, Ready for Gate Scan
      {
        passId: 'LP-2026-1003',
        studentId: otherStudents[1]._id,
        leaveType: 'Medical',
        startDate: '2026-11-23',
        endDate: '2026-11-24',
        expectedReturnDate: '2026-11-24',
        departureTime: '11:00 AM',
        returnTime: '05:00 PM',
        destinationCity: 'City Hospital',
        destinationAddress: 'Apollo Multispeciality, Sector 12',
        reason: 'Dental Surgery and Root Canal Follow-up',
        emergencyContact: '9876543231',
        modeOfTravel: 'Cab / Auto',
        status: LEAVE_STATUS.WARDEN_APPROVED,
        parentApproval: {
          approved: true,
          actionTimestamp: new Date(),
          remarks: 'Medical appointment confirmed.',
        },
        wardenApproval: {
          approved: true,
          wardenId: wardenUser._id,
          actionTimestamp: new Date(),
          remarks: 'Approved. Carry medical prescription upon return.',
        },
      },
      // Request 4: Currently Checked Out (Student Outside)
      {
        passId: 'LP-2026-1004',
        studentId: otherStudents[0]._id,
        leaveType: 'Home Visit',
        startDate: '2026-11-20',
        endDate: '2026-11-24',
        expectedReturnDate: '2026-11-24',
        departureTime: '09:00 AM',
        returnTime: '06:00 PM',
        destinationCity: 'Delhi NCR',
        destinationAddress: 'Sector 62, Noida',
        reason: 'Grandfather 80th Birthday Celebrations',
        emergencyContact: '9876543221',
        modeOfTravel: 'Train',
        status: LEAVE_STATUS.CHECKED_OUT,
        parentApproval: { approved: true, actionTimestamp: new Date() },
        wardenApproval: { approved: true, wardenId: wardenUser._id, actionTimestamp: new Date() },
        gateExit: {
          scannedBy: guardUser._id,
          timestamp: new Date('2026-11-20T09:15:00.000Z'),
          gateNumber: 'Main Gate 1',
        },
      },
      // Request 5: Completed Past Leave (History)
      {
        passId: 'LP-2026-0988',
        studentId: student1._id,
        leaveType: 'Weekend Outing',
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        expectedReturnDate: '2026-11-12',
        departureTime: '04:00 PM',
        returnTime: '08:00 PM',
        destinationCity: 'Jaipur',
        destinationAddress: 'Home',
        reason: 'Diwali Festival Celebrations',
        emergencyContact: '9876543211',
        modeOfTravel: 'Personal Vehicle',
        status: LEAVE_STATUS.CHECKED_IN,
        parentApproval: { approved: true, actionTimestamp: new Date() },
        wardenApproval: { approved: true, wardenId: wardenUser._id, actionTimestamp: new Date() },
        gateExit: {
          scannedBy: guardUser._id,
          timestamp: new Date('2026-11-10T16:05:00.000Z'),
          gateNumber: 'Main Gate 1',
        },
        gateReturn: {
          scannedBy: guardUser._id,
          timestamp: new Date('2026-11-12T19:45:00.000Z'),
          gateNumber: 'Main Gate 1',
          wasOverdue: false,
        },
      },
    ]);

    console.log('⚡ Seeding Real-time Activities...');
    // 6. Seed Activities
    await Activity.insertMany([
      {
        studentName: 'Rohan Verma',
        enrollmentNo: 'EN2022045',
        roomNo: 'A-101',
        type: 'GATE_EXIT',
        title: 'Gate Exit Verified',
        description: 'Exited via Main Gate 1 for Home Visit. Gate Guard: Ramesh Guard.',
        badgeType: 'warning',
      },
      {
        studentName: 'Priya Patel',
        enrollmentNo: 'EN2022078',
        roomNo: 'B-101',
        type: 'WARDEN_APPROVED',
        title: 'Warden Clearance Granted',
        description: 'Approved for Medical Leave by Dr. Vijay K. Singh.',
        badgeType: 'success',
      },
      {
        studentName: 'Vikram Singh',
        enrollmentNo: 'EN2022112',
        roomNo: 'A-201',
        type: 'PARENT_APPROVED',
        title: 'Parent Approval Received',
        description: 'Parent Devendra Singh confirmed approval for Academic Hackathon.',
        badgeType: 'info',
      },
      {
        studentName: 'Aarav Sharma',
        enrollmentNo: 'EN2022001',
        roomNo: 'A-204',
        type: 'LEAVE_SUBMITTED',
        title: 'New Leave Application',
        description: 'Applied for 5-day Home Visit to Jaipur (Sister Wedding).',
        badgeType: 'info',
      },
    ]);

    console.log('🔔 Seeding System Notifications...');
    // 7. Seed Notifications
    await Notification.insertMany([
      {
        userId: studentUser._id,
        role: ROLES.STUDENT,
        title: 'Leave Submitted Successfully',
        message: 'Your leave application LP-2026-1001 has been sent to your parent for approval.',
        type: NOTIFICATION_TYPES.LEAVE_REQUEST,
        requestId: 'LP-2026-1001',
        time: '10 mins ago',
      },
      {
        userId: parentUser._id,
        role: ROLES.PARENT,
        title: 'Leave Approval Requested',
        message: 'Aarav has submitted a leave request for Sister Wedding from 25 Nov to 29 Nov.',
        type: NOTIFICATION_TYPES.LEAVE_REQUEST,
        requestId: 'LP-2026-1001',
        time: '10 mins ago',
      },
      {
        userId: wardenUser._id,
        role: ROLES.WARDEN,
        title: 'Leave Pending Review',
        message: 'Vikram Singh (A-201) has been approved by parent and requires your clearance.',
        type: NOTIFICATION_TYPES.LEAVE_REQUEST,
        requestId: 'LP-2026-1002',
        time: '1 hour ago',
      },
      {
        userId: guardUser._id,
        role: ROLES.GUARD,
        title: 'Approved Exit Ready',
        message: 'Priya Patel (B-101) pass LP-2026-1003 is approved for gate exit clearance.',
        type: NOTIFICATION_TYPES.GATE_EXIT,
        requestId: 'LP-2026-1003',
        time: '2 hours ago',
      },
    ]);

    console.log('📅 Seeding Monthly Attendance Records...');
    // 8. Seed Attendance Records for November 2026
    const attendanceRecords = [];
    const dateList = [
      { day: 1, status: 'PRESENT' },
      { day: 2, status: 'PRESENT' },
      { day: 3, status: 'PRESENT' },
      { day: 4, status: 'PRESENT' },
      { day: 5, status: 'PRESENT' },
      { day: 6, status: 'PRESENT' },
      { day: 7, status: 'PRESENT' },
      { day: 8, status: 'PRESENT' },
      { day: 9, status: 'PRESENT' },
      { day: 10, status: 'ON_LEAVE', remarks: 'Diwali Festival Approved Pass' },
      { day: 11, status: 'ON_LEAVE', remarks: 'Diwali Festival Approved Pass' },
      { day: 12, status: 'ON_LEAVE', remarks: 'Diwali Festival Approved Pass' },
      { day: 13, status: 'ABSENT', remarks: 'Unexcused - Missed Night Roll Call' },
      { day: 14, status: 'PRESENT' },
      { day: 15, status: 'PRESENT' },
      { day: 16, status: 'PRESENT' },
      { day: 17, status: 'PRESENT' },
      { day: 18, status: 'PRESENT' },
      { day: 19, status: 'PRESENT' },
      { day: 20, status: 'PRESENT' },
      { day: 21, status: 'PRESENT' },
      { day: 22, status: 'PRESENT' },
      { day: 23, status: 'PRESENT' },
      { day: 24, status: 'PRESENT', remarks: 'Night Roll Call Verified' },
    ];

    for (const item of dateList) {
      const dayStr = item.day < 10 ? `0${item.day}` : `${item.day}`;
      const fullDate = `2026-11-${dayStr}`;
      attendanceRecords.push({
        studentId: student1._id,
        userId: studentUser._id,
        studentName: student1.name,
        enrollmentNo: student1.enrollmentNo,
        roomNo: student1.roomNo,
        date: fullDate,
        status: item.status,
        session: 'NIGHT_ROLL_CALL',
        markedAt: item.status === 'ABSENT' ? '-' : '08:30 PM',
        markedBy: 'Dr. Vijay K. Singh (Warden)',
        remarks: item.remarks || 'Present during physical roll-call',
      });
    }

    await Attendance.insertMany(attendanceRecords);

    console.log('====================================================');
    console.log('✅ HostelEase Database Seed Completed Successfully!');
    console.log('====================================================');
    console.log('Demo Credentials:');
    console.log('  👨‍🎓 Student:  student@hosteleasy.demo / Password@123 (or phone 9876543210)');
    console.log('  👨‍👦 Parent:   parent@hosteleasy.demo  / Password@123 (or phone 9876543211)');
    console.log('  👨‍💼 Warden:   warden@hosteleasy.demo  / Password@123 (or phone 9876543212)');
    console.log('  🛡️ Guard:    guard@hosteleasy.demo   / Password@123 (or phone 9876543213)');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder encountered a fatal error:', error);
    process.exit(1);
  }
}

seed();
