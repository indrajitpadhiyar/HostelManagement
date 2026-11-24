import Student from '../models/Student.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import Guard from '../models/Guard.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { HOSTEL_STATUS, LEAVE_STATUS, NOTIFICATION_TYPES } from '../config/constants.js';

/**
 * @desc    Get Guard Terminal Dashboard Metrics
 * @route   GET /api/v1/guard/dashboard
 * @access  Private (Guard, Warden)
 */
export const getGuardDashboard = asyncHandler(async (req, res) => {
  const students = await Student.find();
  const leaves = await LeaveRequest.find();

  const totalStudents = students.length;
  const currentlyOutside = students.filter((s) => s.hostelStatus === HOSTEL_STATUS.OUTSIDE).length;
  const presentInCampus = students.filter((s) => s.hostelStatus === HOSTEL_STATUS.PRESENT).length;

  const todayStr = new Date().toISOString().split('T')[0];

  const approvedExitsReady = leaves.filter(
    (l) => l.status === LEAVE_STATUS.WARDEN_APPROVED
  ).length;

  const expectedReturnsToday = leaves.filter(
    (l) => l.status === LEAVE_STATUS.CHECKED_OUT && l.expectedReturnDate.startsWith(todayStr.slice(0, 7))
  ).length;

  const overdueList = leaves.filter(
    (l) => l.status === LEAVE_STATUS.CHECKED_OUT && l.expectedReturnDate < todayStr
  );

  const recentMovements = await Activity.find({
    type: { $in: ['GATE_EXIT', 'GATE_RETURN'] },
  })
    .sort({ createdAt: -1 })
    .limit(8);

  res.status(200).json(
    ApiResponse.success(
      {
        metrics: {
          currentlyOutside,
          presentInCampus,
          approvedExitsReady,
          expectedReturnsToday,
          overdueCount: overdueList.length,
          totalStudents,
        },
        overdueList,
        recentMovements,
      },
      'Security terminal metrics retrieved'
    )
  );
});

/**
 * @desc    Scan or Verify Student by QR/Enrollment Roll/Pass ID
 * @route   POST /api/v1/guard/scan-verify
 * @access  Private (Guard)
 */
export const scanVerify = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    throw ApiError.badRequest('Please scan a QR code or enter enrollment/pass ID.');
  }

  const q = query.trim().toUpperCase();

  // Find student by enrollment or ID
  const student = await Student.findOne({
    $or: [{ enrollmentNo: q }, { _id: q.match(/^[0-9a-fA-F]{24}$/) ? q : null }],
  }).populate('userId', 'name mobile avatar');

  if (!student) {
    throw ApiError.notFound(`No resident found matching query [${query}].`);
  }

  // Find active pass
  const activePass = await LeaveRequest.findOne({
    studentId: student._id,
    status: {
      $in: [
        LEAVE_STATUS.WARDEN_APPROVED,
        LEAVE_STATUS.CHECKED_OUT,
        LEAVE_STATUS.EXTENSION_PENDING,
        LEAVE_STATUS.EXTENSION_APPROVED,
      ],
    },
  }).sort({ createdAt: -1 });

  const isEligibleForExit =
    student.hostelStatus === HOSTEL_STATUS.PRESENT &&
    activePass?.status === LEAVE_STATUS.WARDEN_APPROVED;

  const isEligibleForReturn =
    student.hostelStatus === HOSTEL_STATUS.OUTSIDE &&
    (activePass?.status === LEAVE_STATUS.CHECKED_OUT ||
      activePass?.status === LEAVE_STATUS.EXTENSION_PENDING ||
      activePass?.status === LEAVE_STATUS.EXTENSION_APPROVED);

  res.status(200).json(
    ApiResponse.success({
      student: {
        id: student._id,
        name: student.userId?.name || 'Student',
        enrollmentNo: student.enrollmentNo,
        roomNo: student.roomNo,
        department: student.department,
        hostelStatus: student.hostelStatus,
        mobile: student.userId?.mobile,
        avatar: student.userId?.avatar,
        parentName: student.parentName,
        parentMobile: student.parentMobile,
      },
      activePass: activePass || null,
      verification: {
        isEligibleForExit,
        isEligibleForReturn,
        recommendedAction: isEligibleForExit ? 'GATE_EXIT' : isEligibleForReturn ? 'GATE_RETURN' : 'NONE',
      },
    }, 'Student verification completed')
  );
});

/**
 * @desc    Record Student Gate Exit
 * @route   POST /api/v1/guard/record-exit
 * @access  Private (Guard)
 */
export const recordGateExit = asyncHandler(async (req, res) => {
  const { studentId, leaveId, gateNumber = 'Main Gate 1', remarks } = req.body;

  const student = await Student.findById(studentId).populate('userId', 'name');
  if (!student) {
    throw ApiError.notFound('Student record not found.');
  }

  const leave = await LeaveRequest.findOne({
    $or: [{ _id: leaveId }, { leaveId }],
  });

  if (!leave) {
    throw ApiError.notFound('Active leave pass not found.');
  }

  if (leave.status !== LEAVE_STATUS.WARDEN_APPROVED) {
    throw ApiError.badRequest(`Pass is not approved for checkout. Current status: ${leave.status}`);
  }

  const exitTime = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Update Leave Status
  leave.status = LEAVE_STATUS.CHECKED_OUT;
  leave.actualExitTime = exitTime;
  leave.guardExitScanAt = exitTime;
  await leave.save();

  // Update Student Status
  student.hostelStatus = HOSTEL_STATUS.OUTSIDE;
  await student.save();

  // Log Activity
  await Activity.create({
    studentName: student.userId?.name || leave.studentName,
    enrollmentNo: student.enrollmentNo,
    roomNo: student.roomNo,
    type: 'GATE_EXIT',
    title: 'Campus Departure Logged',
    description: `Exited through ${gateNumber} for ${leave.destinationCity}. Expected return: ${leave.expectedReturnDate}.`,
    badgeType: 'warning',
    status: LEAVE_STATUS.CHECKED_OUT,
  });

  // Notify Parent & Warden
  await Notification.create({
    role: 'parent',
    title: 'Student Exited Campus Gate',
    message: `${student.userId?.name} has officially departed through ${gateNumber} at ${exitTime}.`,
    type: NOTIFICATION_TYPES.GATE_EXIT,
    requestId: leave.leaveId,
  });

  res.status(200).json(
    ApiResponse.success(
      { leave, studentStatus: student.hostelStatus },
      `Exit recorded. Student marked OUTSIDE at ${exitTime}`
    )
  );
});

/**
 * @desc    Record Student Gate Return
 * @route   POST /api/v1/guard/record-return
 * @access  Private (Guard)
 */
export const recordGateReturn = asyncHandler(async (req, res) => {
  const { studentId, leaveId, gateNumber = 'Main Gate 1', remarks } = req.body;

  const student = await Student.findById(studentId).populate('userId', 'name');
  if (!student) {
    throw ApiError.notFound('Student record not found.');
  }

  const leave = await LeaveRequest.findOne({
    $or: [{ _id: leaveId }, { leaveId }],
  });

  const returnTime = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  if (leave) {
    leave.status = LEAVE_STATUS.CHECKED_IN;
    leave.actualReturnTime = returnTime;
    leave.guardReturnScanAt = returnTime;
    await leave.save();
  }

  // Update Student Status to Present
  student.hostelStatus = HOSTEL_STATUS.PRESENT;
  await student.save();

  // Log Activity
  await Activity.create({
    studentName: student.userId?.name || 'Student',
    enrollmentNo: student.enrollmentNo,
    roomNo: student.roomNo,
    type: 'GATE_RETURN',
    title: 'Campus Check-In Completed',
    description: `Safely arrived through ${gateNumber}. Marked present in hostel.`,
    badgeType: 'success',
    status: LEAVE_STATUS.CHECKED_IN,
  });

  // Notify Parent
  await Notification.create({
    role: 'parent',
    title: 'Safe Campus Return',
    message: `${student.userId?.name} checked back into campus through ${gateNumber} at ${returnTime}.`,
    type: NOTIFICATION_TYPES.GATE_RETURN,
    requestId: leave?.leaveId,
  });

  res.status(200).json(
    ApiResponse.success(
      { studentStatus: student.hostelStatus },
      `Check-in recorded. Student marked PRESENT IN HOSTEL at ${returnTime}`
    )
  );
});

/**
 * @desc    Get Gate Movement History
 * @route   GET /api/v1/guard/gate-history
 * @access  Private (Guard, Warden)
 */
export const getGateHistory = asyncHandler(async (req, res) => {
  const movements = await Activity.find({
    type: { $in: ['GATE_EXIT', 'GATE_RETURN'] },
  }).sort({ createdAt: -1 });

  res.status(200).json(ApiResponse.success(movements, 'Gate movement history retrieved'));
});
