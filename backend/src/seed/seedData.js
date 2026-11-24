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
import { ROLES, HOSTEL_STATUS } from '../config/constants.js';

async function seed() {
  console.log('🌱 Starting HostelEase Enterprise Database Seeder...');
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('\n❌ Seeding aborted: Could not connect to MongoDB Atlas.');
    console.error('👉 Please whitelist your IP in MongoDB Atlas > Network Access.');
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
    await Room.insertMany([
      { roomNo: 'A-204', block: 'Block A', floor: '2nd Floor', type: 'Double Occupancy (AC)', capacity: 2, studentIds: [] },
      { roomNo: 'A-101', block: 'Block A', floor: '1st Floor', type: 'Double Occupancy (AC)', capacity: 2, studentIds: [] },
      { roomNo: 'A-102', block: 'Block A', floor: '1st Floor', type: 'Double Occupancy', capacity: 2, studentIds: [] },
      { roomNo: 'A-201', block: 'Block A', floor: '2nd Floor', type: 'Double Occupancy', capacity: 2, studentIds: [] },
      { roomNo: 'A-301', block: 'Block A', floor: '3rd Floor', type: 'Single Premium', capacity: 1, studentIds: [] },
      { roomNo: 'B-101', block: 'Block B', floor: '1st Floor', type: 'Double Occupancy', capacity: 2, studentIds: [] },
      { roomNo: 'B-102', block: 'Block B', floor: '1st Floor', type: 'Double Occupancy', capacity: 2, studentIds: [] },
      { roomNo: 'B-201', block: 'Block B', floor: '2nd Floor', type: 'Triple Non-AC', capacity: 3, studentIds: [] },
    ]);

    console.log('🎓 Seeding Students Directory...');
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
        hostelStatus: HOSTEL_STATUS.PRESENT,
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

    console.log('✨ Clean database ready with 0 dummy leave requests, 0 fake activities, and 0 fake attendance records.');
    console.log('====================================================');
    console.log('✅ HostelEase Clean Database Seed Completed Successfully!');
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
