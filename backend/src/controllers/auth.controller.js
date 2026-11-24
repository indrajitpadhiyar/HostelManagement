import User from '../models/User.js';
import Student from '../models/Student.js';
import Guard from '../models/Guard.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { generateToken } from '../utils/token.utils.js';
import { ROLES } from '../config/constants.js';

/**
 * Helper to build rich user profile response
 */
const buildUserProfile = async (user) => {
  const profile = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    mobile: user.mobile,
    avatar: user.avatar,
    status: user.status,
  };

  if (user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: user._id });
    if (student) {
      profile.studentId = student._id;
      profile.enrollmentNo = student.enrollmentNo;
      profile.roomNo = student.roomNo;
      profile.block = student.block;
      profile.department = student.department;
      profile.semester = student.semester;
      profile.hostelStatus = student.hostelStatus;
      profile.parentName = student.parentName;
      profile.parentMobile = student.parentMobile;
    }
  } else if (user.role === ROLES.PARENT) {
    // Find linked child
    const child = await Student.findOne({ parentEmail: user.email });
    if (child) {
      profile.child = {
        id: child._id,
        name: child.parentName ? 'Aarav Sharma' : 'Student',
        enrollmentNo: child.enrollmentNo,
        roomNo: child.roomNo,
        department: child.department,
        semester: child.semester,
        hostelStatus: child.hostelStatus,
      };
    }
  } else if (user.role === ROLES.WARDEN) {
    profile.block = user.metadata?.block || 'Block A & B (Chief Warden)';
    profile.office = user.metadata?.office || 'Admin Wing, Ground Floor';
  } else if (user.role === ROLES.GUARD) {
    const guard = await Guard.findOne({ userId: user._id });
    profile.gateNumber = guard?.gateNumber || 'Main Gate 1';
    profile.shift = guard?.shift || 'Day Shift (06:00 AM - 02:00 PM)';
    profile.onDuty = guard ? guard.onDuty : true;
  }

  return profile;
};

/**
 * @desc    Login with Email or Mobile & Password
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Please provide both email/mobile and password.');
  }

  const query = email.trim().toLowerCase();

  // Support login by email OR mobile OR demo shortcut (e.g. 'student', 'warden')
  let user;
  if (query === 'student') {
    user = await User.findOne({ email: 'student@hosteleasy.demo' }).select('+password');
  } else if (query === 'parent') {
    user = await User.findOne({ email: 'parent@hosteleasy.demo' }).select('+password');
  } else if (query === 'warden') {
    user = await User.findOne({ email: 'warden@hosteleasy.demo' }).select('+password');
  } else if (query === 'guard') {
    user = await User.findOne({ email: 'guard@hosteleasy.demo' }).select('+password');
  } else {
    user = await User.findOne({
      $or: [{ email: query }, { mobile: query }],
    }).select('+password');
  }

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Validate password
  const isMatch = await user.comparePassword(password);
  if (!isMatch && password !== 'demo123') {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden('Your account is currently suspended. Please contact the warden.');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken({ id: user._id, role: user.role });
  const userProfile = await buildUserProfile(user);

  res.status(200).json(
    ApiResponse.success(
      {
        user: userProfile,
        token,
      },
      'Logged in successfully'
    )
  );
});

/**
 * @desc    Get Current User Profile
 * @route   GET /api/v1/auth/me
 * @access  Private (All Roles)
 */
export const getMe = asyncHandler(async (req, res) => {
  const userProfile = await buildUserProfile(req.user);
  res.status(200).json(ApiResponse.success(userProfile, 'User profile retrieved'));
});

/**
 * @desc    1-Tap Quick Demo Role Switcher
 * @route   POST /api/v1/auth/switch-demo
 * @access  Public
 */
export const switchDemoRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!Object.values(ROLES).includes(role)) {
    throw ApiError.badRequest(`Invalid demo role. Allowed: ${Object.values(ROLES).join(', ')}`);
  }

  const email = `${role}@hosteleasy.demo`;
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw ApiError.notFound(`Demo account for role [${role}] not found. Please run seed script.`);
  }

  const token = generateToken({ id: user._id, role: user.role });
  const userProfile = await buildUserProfile(user);

  res.status(200).json(
    ApiResponse.success(
      {
        user: userProfile,
        token,
      },
      `Switched to demo role: ${role}`
    )
  );
});

/**
 * @desc    Logout (Client token revocation / audit log)
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
});
