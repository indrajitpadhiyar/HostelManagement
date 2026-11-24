import LeaveRequest from '../models/LeaveRequest.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { LEAVE_STATUS, ROLES, NOTIFICATION_TYPES } from '../config/constants.js';

/**
 * @desc    Get Leaves (Scoped by User Role)
 * @route   GET /api/v1/leaves
 * @access  Private (All Roles)
 */
export const getLeaves = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;
  const user = req.user;

  let query = {};

  // Role Scoping
  if (user.role === ROLES.STUDENT) {
    query.userId = user._id;
  } else if (user.role === ROLES.PARENT) {
    // Leaves for parent's linked student
    const child = await Student.findOne({ parentEmail: user.email });
    if (child) {
      query.studentId = child._id;
    }
  }

  // Filter by status if provided
  if (status && status !== 'ALL') {
    if (status === 'PENDING') {
      query.status = {
        $in: [
          LEAVE_STATUS.PENDING_PARENT_APPROVAL,
          LEAVE_STATUS.EXTENSION_PENDING,
        ],
      };
    } else if (status === 'APPROVED') {
      query.status = {
        $in: [
          LEAVE_STATUS.PARENT_APPROVED,
          LEAVE_STATUS.WARDEN_APPROVED,
          LEAVE_STATUS.EXTENSION_APPROVED,
        ],
      };
    } else {
      query.status = status;
    }
  }

  let leaves = await LeaveRequest.find(query).sort({ createdAt: -1 });

  // In-memory text search if needed
  if (search) {
    const q = search.trim().toLowerCase();
    leaves = leaves.filter(
      (l) =>
        l.studentName.toLowerCase().includes(q) ||
        l.enrollmentNo.toLowerCase().includes(q) ||
        l.roomNo.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.destinationCity.toLowerCase().includes(q) ||
        l.leaveId.toLowerCase().includes(q)
    );
  }

  res.status(200).json(
    ApiResponse.success(leaves, 'Leave requests retrieved successfully', 200, {
      total: leaves.length,
      page: Number(page),
      limit: Number(limit),
    })
  );
});

/**
 * @desc    Get Single Leave Request by ID
 * @route   GET /api/v1/leaves/:id
 * @access  Private
 */
export const getLeaveById = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findOne({
    $or: [{ _id: req.params.id }, { leaveId: req.params.id }],
  });

  if (!leave) {
    throw ApiError.notFound('Leave request not found.');
  }

  res.status(200).json(ApiResponse.success(leave, 'Leave request details'));
});

/**
 * @desc    Submit New Leave Request (Student Only)
 * @route   POST /api/v1/leaves
 * @access  Private (Student)
 */
export const applyLeave = asyncHandler(async (req, res) => {
  const {
    reason,
    detailedExplanation,
    destinationAddress,
    destinationCity,
    emergencyContact,
    departureDate,
    expectedReturnDate,
  } = req.body;

  if (
    !reason ||
    !destinationAddress ||
    !destinationCity ||
    !departureDate ||
    !expectedReturnDate
  ) {
    throw ApiError.badRequest('Please provide all mandatory leave pass fields.');
  }

  const student = req.studentProfile;
  if (!student) {
    throw ApiError.badRequest('Student profile not found for this user.');
  }

  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const leaveId = `LR-${year}-${randomSuffix}`;

  const newLeave = await LeaveRequest.create({
    leaveId,
    studentId: student._id,
    userId: req.user._id,
    studentName: req.user.name,
    enrollmentNo: student.enrollmentNo,
    department: student.department,
    semester: student.semester,
    roomNo: student.roomNo,
    reason,
    detailedExplanation: detailedExplanation || '',
    destinationAddress,
    destinationCity,
    emergencyContact: emergencyContact || student.parentMobile,
    departureDate,
    expectedReturnDate,
    status: LEAVE_STATUS.PENDING_PARENT_APPROVAL,
    submittedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
  });

  // Create Parent Notification
  await Notification.create({
    role: 'parent',
    title: 'New Leave Request Submitted',
    message: `${req.user.name} applied for leave to ${destinationCity} (${departureDate} - ${expectedReturnDate}). Requires your approval.`,
    type: NOTIFICATION_TYPES.LEAVE_REQUEST,
    requestId: leaveId,
  });

  // Log Activity
  await Activity.create({
    studentName: req.user.name,
    enrollmentNo: student.enrollmentNo,
    roomNo: student.roomNo,
    type: 'LEAVE_SUBMITTED',
    title: 'Leave Request Submitted',
    description: `Applied for leave: ${reason} to ${destinationCity}.`,
    badgeType: 'info',
    status: LEAVE_STATUS.PENDING_PARENT_APPROVAL,
  });

  res.status(201).json(ApiResponse.created(newLeave, 'Leave application submitted. Sent to parent for approval.'));
});

/**
 * @desc    Parent Decision (Approve or Reject)
 * @route   POST /api/v1/leaves/:id/parent-decision
 * @access  Private (Parent)
 */
export const parentDecision = asyncHandler(async (req, res) => {
  const { action, comment } = req.body; // 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    throw ApiError.badRequest('Action must be either "approve" or "reject".');
  }

  const leave = await LeaveRequest.findOne({
    $or: [{ _id: req.params.id }, { leaveId: req.params.id }],
  });

  if (!leave) {
    throw ApiError.notFound('Leave request not found.');
  }

  if (leave.status !== LEAVE_STATUS.PENDING_PARENT_APPROVAL) {
    throw ApiError.badRequest(`Cannot take action on leave in status: ${leave.status}`);
  }

  const nowFormatted = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  if (action === 'approve') {
    leave.status = LEAVE_STATUS.PARENT_APPROVED;
    leave.parentActionAt = nowFormatted;
    leave.parentActionComment = comment || 'Parent authorized this leave request.';
    await leave.save();

    // Notify Warden & Student
    await Notification.create({
      role: 'warden',
      title: 'Parent Approval Received',
      message: `Parent approved leave for ${leave.studentName} (${leave.enrollmentNo}). Ready for warden institutional clearance.`,
      type: NOTIFICATION_TYPES.LEAVE_APPROVED,
      requestId: leave.leaveId,
    });

    await Notification.create({
      userId: leave.userId,
      role: 'student',
      title: 'Parent Approved Your Leave',
      message: `Your parent approved your leave request. Now awaiting final Warden clearance.`,
      type: NOTIFICATION_TYPES.LEAVE_APPROVED,
      requestId: leave.leaveId,
    });

    // Log Activity
    await Activity.create({
      studentName: leave.studentName,
      enrollmentNo: leave.enrollmentNo,
      roomNo: leave.roomNo,
      type: 'PARENT_APPROVED',
      title: 'Parent Consent Confirmed',
      description: `Parent authorized departure for ${leave.reason}.`,
      badgeType: 'success',
      status: LEAVE_STATUS.PARENT_APPROVED,
    });

    return res.status(200).json(ApiResponse.success(leave, 'Parent approval confirmed. Forwarded to Warden.'));
  } else {
    leave.status = LEAVE_STATUS.PARENT_REJECTED;
    leave.parentActionAt = nowFormatted;
    leave.rejectionReason = comment || 'Parent denied authorization.';
    await leave.save();

    await Notification.create({
      userId: leave.userId,
      role: 'student',
      title: 'Leave Request Declined by Parent',
      message: `Your parent declined your leave pass. Reason: ${leave.rejectionReason}`,
      type: NOTIFICATION_TYPES.LEAVE_REJECTED,
      requestId: leave.leaveId,
    });

    return res.status(200).json(ApiResponse.success(leave, 'Leave request declined by parent.'));
  }
});

/**
 * @desc    Warden Decision (Enforces Parent Approval Requirement)
 * @route   POST /api/v1/leaves/:id/warden-decision
 * @access  Private (Warden)
 */
export const wardenDecision = asyncHandler(async (req, res) => {
  const { action, reason } = req.body; // 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    throw ApiError.badRequest('Action must be "approve" or "reject".');
  }

  const leave = await LeaveRequest.findOne({
    $or: [{ _id: req.params.id }, { leaveId: req.params.id }],
  });

  if (!leave) {
    throw ApiError.notFound('Leave request not found.');
  }

  // Strict Business Rule: Warden can only decide on parent-approved requests
  if (leave.status !== LEAVE_STATUS.PARENT_APPROVED) {
    throw ApiError.badRequest(
      `Warden clearance requires parent approval first. Current status: ${leave.status}`
    );
  }

  const nowFormatted = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  if (action === 'approve') {
    leave.status = LEAVE_STATUS.WARDEN_APPROVED;
    leave.wardenActionAt = nowFormatted;
    leave.wardenActionComment = reason || 'Official institutional gate clearance approved.';
    await leave.save();

    // Notify Guard Terminal
    await Notification.create({
      role: 'guard',
      title: 'New Gate Clearance Issued',
      message: `Pass #${leave.leaveId} cleared for ${leave.studentName} (${leave.roomNo}). Eligible for campus exit.`,
      type: NOTIFICATION_TYPES.LEAVE_APPROVED,
      requestId: leave.leaveId,
    });

    // Notify Student
    await Notification.create({
      userId: leave.userId,
      role: 'student',
      title: 'Official Gate Pass Granted!',
      message: `Warden authorized your institutional clearance. Show QR pass at main security gate.`,
      type: NOTIFICATION_TYPES.LEAVE_APPROVED,
      requestId: leave.leaveId,
    });

    // Log Activity
    await Activity.create({
      studentName: leave.studentName,
      enrollmentNo: leave.enrollmentNo,
      roomNo: leave.roomNo,
      type: 'WARDEN_APPROVED',
      title: 'Warden Clearance Granted',
      description: `Gate pass ${leave.leaveId} authorized. Guard notified for checkout.`,
      badgeType: 'success',
      status: LEAVE_STATUS.WARDEN_APPROVED,
    });

    return res.status(200).json(ApiResponse.success(leave, 'Gate pass granted successfully.'));
  } else {
    leave.status = LEAVE_STATUS.REJECTED;
    leave.wardenActionAt = nowFormatted;
    leave.rejectionReason = reason || 'Declined by hostel administration.';
    await leave.save();

    await Notification.create({
      userId: leave.userId,
      role: 'student',
      title: 'Clearance Declined by Warden',
      message: `Your leave request was declined: ${leave.rejectionReason}`,
      type: NOTIFICATION_TYPES.LEAVE_REJECTED,
      requestId: leave.leaveId,
    });

    return res.status(200).json(ApiResponse.success(leave, 'Clearance declined.'));
  }
});

/**
 * @desc    Request Leave Extension (Student)
 * @route   POST /api/v1/leaves/:id/extend
 * @access  Private (Student)
 */
export const requestExtension = asyncHandler(async (req, res) => {
  const { extensionDays, newExpectedReturnDate, reason } = req.body;

  if (!newExpectedReturnDate || !reason) {
    throw ApiError.badRequest('New return date and reason are required for extension.');
  }

  const leave = await LeaveRequest.findOne({
    $or: [{ _id: req.params.id }, { leaveId: req.params.id }],
  });

  if (!leave) {
    throw ApiError.notFound('Leave request not found.');
  }

  leave.status = LEAVE_STATUS.EXTENSION_PENDING;
  leave.extension = {
    requestedDays: Number(extensionDays) || 2,
    newReturnDate: newExpectedReturnDate,
    reason,
    status: 'EXTENSION_PENDING',
    submittedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
  };
  await leave.save();

  // Notify Warden & Parent
  await Notification.create({
    role: 'warden',
    title: 'Leave Extension Requested',
    message: `${leave.studentName} requested return extension until ${newExpectedReturnDate}. Reason: ${reason}`,
    type: NOTIFICATION_TYPES.LEAVE_REQUEST,
    requestId: leave.leaveId,
  });

  await Activity.create({
    studentName: leave.studentName,
    enrollmentNo: leave.enrollmentNo,
    roomNo: leave.roomNo,
    type: 'EXTENSION_REQUESTED',
    title: 'Extension Requested',
    description: `Requested extension to ${newExpectedReturnDate}: ${reason}`,
    badgeType: 'warning',
    status: 'EXTENSION_PENDING',
  });

  res.status(200).json(ApiResponse.success(leave, 'Extension request registered.'));
});
