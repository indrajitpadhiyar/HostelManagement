import Student from '../models/Student.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Activity from '../models/Activity.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * @desc    Get All Students with Search, Filtering & Pagination
 * @route   GET /api/v1/students
 * @access  Private (Warden, Guard)
 */
export const getStudents = asyncHandler(async (req, res) => {
  const { search, dept, status, room, page = 1, limit = 50 } = req.query;

  const query = {};

  if (dept && dept !== 'ALL') {
    query.deptCode = dept;
  }

  if (status && status !== 'ALL') {
    query.hostelStatus = status;
  }

  if (room) {
    query.roomNo = room;
  }

  // Populate user data
  let studentQuery = Student.find(query).populate('userId', 'name email mobile avatar status');

  const allStudents = await studentQuery.exec();

  // Filter by search query across name, enrollment, and room
  let filtered = allStudents;
  if (search) {
    const q = search.trim().toLowerCase();
    filtered = allStudents.filter((s) => {
      const name = s.userId?.name?.toLowerCase() || '';
      const roll = s.enrollmentNo.toLowerCase();
      const rNo = s.roomNo.toLowerCase();
      return name.includes(q) || roll.includes(q) || rNo.includes(q);
    });
  }

  // Flatten response structure for mobile client
  const formatted = filtered.map((s) => ({
    id: s._id,
    userId: s.userId?._id,
    name: s.userId?.name || 'Student',
    enrollmentNo: s.enrollmentNo,
    email: s.userId?.email || '',
    mobile: s.userId?.mobile || '',
    avatar: s.userId?.avatar,
    roomNo: s.roomNo,
    block: s.block,
    floor: s.floor,
    department: s.department,
    deptCode: s.deptCode,
    semester: s.semester,
    year: s.year,
    hostelStatus: s.hostelStatus,
    parentName: s.parentName,
    parentEmail: s.parentEmail,
    parentMobile: s.parentMobile,
    academicHistory: s.academicHistory || [],
  }));

  res.status(200).json(
    ApiResponse.success(
      formatted,
      'Students retrieved successfully',
      200,
      { total: formatted.length, page: Number(page), limit: Number(limit) }
    )
  );
});

/**
 * @desc    Get Single Student Details by ID
 * @route   GET /api/v1/students/:id
 * @access  Private
 */
export const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('userId', 'name email mobile avatar');

  if (!student) {
    throw ApiError.notFound('Student record not found.');
  }

  // Get active and historical leaves
  const leaves = await LeaveRequest.find({ studentId: student._id }).sort({ createdAt: -1 });

  const result = {
    id: student._id,
    userId: student.userId?._id,
    name: student.userId?.name,
    email: student.userId?.email,
    mobile: student.userId?.mobile,
    avatar: student.userId?.avatar,
    enrollmentNo: student.enrollmentNo,
    roomNo: student.roomNo,
    block: student.block,
    floor: student.floor,
    department: student.department,
    deptCode: student.deptCode,
    semester: student.semester,
    hostelStatus: student.hostelStatus,
    parentName: student.parentName,
    parentMobile: student.parentMobile,
    parentEmail: student.parentEmail,
    academicHistory: student.academicHistory,
    leaveHistory: leaves,
  };

  res.status(200).json(ApiResponse.success(result, 'Student details retrieved'));
});

/**
 * @desc    Create/Enroll New Student
 * @route   POST /api/v1/students
 * @access  Private (Warden)
 */
export const createStudent = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    enrollmentNo,
    roomNo,
    department,
    deptCode,
    semester,
    mobile,
    parentName,
    parentMobile,
    password,
  } = req.body;

  if (!name || !enrollmentNo || !roomNo) {
    throw ApiError.badRequest('Name, Enrollment number, and Room number are required.');
  }

  const generatedPass = password || `Student@${enrollmentNo.toUpperCase().trim()}`;

  // Check if enrollment exists
  const existingEnrollment = await Student.findOne({ enrollmentNo: enrollmentNo.toUpperCase() });
  if (existingEnrollment) {
    throw ApiError.conflict(`Student with roll number ${enrollmentNo} already exists.`);
  }

  // Check room capacity
  const targetRoom = await Room.findOne({ roomNo: roomNo.toUpperCase() });
  if (targetRoom && targetRoom.available <= 0) {
    throw ApiError.badRequest(`Room ${roomNo} is already at full capacity (${targetRoom.capacity} beds occupied).`);
  }

  const studentEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@student.demo`;

  // Create User auth account
  const user = await User.create({
    name,
    email: studentEmail,
    password: generatedPass,
    role: 'student',
    mobile: mobile || '',
  });

  // Create Student Profile
  const student = await Student.create({
    userId: user._id,
    enrollmentNo: enrollmentNo.toUpperCase(),
    roomNo: roomNo.toUpperCase(),
    block: targetRoom?.block || 'Block A',
    floor: targetRoom?.floor || '1st Floor',
    department: department || 'Computer Science & Engineering',
    deptCode: deptCode || 'CSE',
    semester: semester || '6th Semester',
    parentName: parentName || 'Parent / Guardian',
    parentMobile: parentMobile || '+91 98765 00000',
  });

  // Update room occupancy
  if (targetRoom) {
    targetRoom.studentIds.push(student._id);
    await targetRoom.save();
  }

  // Audit activity
  await Activity.create({
    studentName: name,
    enrollmentNo: enrollmentNo.toUpperCase(),
    roomNo: roomNo.toUpperCase(),
    type: 'ROOM_REALLOCATED',
    title: 'Student Enrolled',
    description: `Enrolled into hostel room ${roomNo}.`,
    badgeType: 'info',
  });

  res.status(201).json(ApiResponse.created(student, 'Student enrolled successfully'));
});

/**
 * @desc    Reallocate Student Room
 * @route   PUT /api/v1/students/:id/reallocate
 * @access  Private (Warden)
 */
export const reallocateRoom = asyncHandler(async (req, res) => {
  const { newRoomNo } = req.body;

  if (!newRoomNo) {
    throw ApiError.badRequest('New room number is required.');
  }

  const student = await Student.findById(req.params.id).populate('userId', 'name');
  if (!student) {
    throw ApiError.notFound('Student not found.');
  }

  const oldRoomNo = student.roomNo;
  const newRoom = await Room.findOne({ roomNo: newRoomNo.toUpperCase() });

  if (newRoom && newRoom.available <= 0) {
    throw ApiError.badRequest(`Room ${newRoomNo} is full. Cannot allocate.`);
  }

  // Remove from old room
  if (oldRoomNo) {
    const oldRoom = await Room.findOne({ roomNo: oldRoomNo });
    if (oldRoom) {
      oldRoom.studentIds = oldRoom.studentIds.filter((id) => !id.equals(student._id));
      await oldRoom.save();
    }
  }

  // Add to new room
  if (newRoom) {
    newRoom.studentIds.push(student._id);
    await newRoom.save();
    student.block = newRoom.block;
    student.floor = newRoom.floor;
  }

  student.roomNo = newRoomNo.toUpperCase();
  await student.save();

  // Audit activity
  await Activity.create({
    studentName: student.userId?.name || 'Student',
    enrollmentNo: student.enrollmentNo,
    roomNo: newRoomNo.toUpperCase(),
    type: 'ROOM_REALLOCATED',
    title: 'Room Reallocated',
    description: `Moved from ${oldRoomNo} to ${newRoomNo}.`,
    badgeType: 'info',
  });

  res.status(200).json(ApiResponse.success(student, `Room reallocated to ${newRoomNo}`));
});

/**
 * @desc    Delete Student
 * @route   DELETE /api/v1/students/:id
 * @access  Private (Warden)
 */
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    throw ApiError.notFound('Student record not found.');
  }

  // Free up room bed
  if (student.roomNo) {
    const room = await Room.findOne({ roomNo: student.roomNo });
    if (room) {
      room.studentIds = room.studentIds.filter((id) => !id.equals(student._id));
      await room.save();
    }
  }

  // Delete User and Student
  await User.findByIdAndDelete(student.userId);
  await Student.findByIdAndDelete(student._id);

  res.status(200).json(ApiResponse.success(null, 'Student record removed and bed vacated'));
});
