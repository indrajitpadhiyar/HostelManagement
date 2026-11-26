import User from '../models/User.js';
import Student from '../models/Student.js';
import Guard from '../models/Guard.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { generateToken } from '../utils/token.utils.js';
import { ROLES, NOTIFICATION_TYPES, HOSTEL_STATUS } from '../config/constants.js';

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
      profile.parentEmail = student.parentEmail;
      profile.approvalStatus = student.approvalStatus || 'APPROVED';
    }
  } else if (user.role === ROLES.PARENT) {
    // Find linked child
    const child = await Student.findOne({
      $or: [
        { parentUserId: user._id },
        { parentEmail: user.email },
        ...(user.mobile ? [{ parentMobile: user.mobile }] : []),
      ],
    });
    if (child) {
      profile.child = {
        id: child._id,
        name: child.name || 'Student',
        enrollmentNo: child.enrollmentNo,
        roomNo: child.roomNo,
        department: child.department,
        semester: child.semester,
        hostelStatus: child.hostelStatus,
      };
      profile.studentId = child._id;
      profile.studentName = child.name;
    }
  } else if (user.role === ROLES.WARDEN) {
    profile.block = user.metadata?.block || 'Chief Warden';
    profile.office = user.metadata?.office || 'Admin Wing';
  } else if (user.role === ROLES.GUARD) {
    const guard = await Guard.findOne({ userId: user._id });
    profile.gateNumber = guard?.gateNumber || 'Main Gate 1';
    profile.shift = guard?.shift || 'Day Shift (06:00 AM - 02:00 PM)';
    profile.onDuty = guard ? guard.onDuty : true;
  }

  return profile;
};

/**
 * @desc    Login with Email, Mobile or Enrollment No & Password
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Please provide your login identifier and password.');
  }

  const query = email.trim().toLowerCase();

  let user = await User.findOne({
    $or: [{ email: query }, { mobile: query }],
  }).select('+password');

  // If not found by email or mobile, check if student enrollment number was entered
  if (!user) {
    const student = await Student.findOne({
      enrollmentNo: query.toUpperCase(),
    });
    if (student && student.userId) {
      user = await User.findById(student.userId).select('+password');
    }
  }

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Validate password strictly via bcrypt
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (user.status !== 'active') {
    if (user.status === 'pending_approval') {
      throw ApiError.forbidden('Your registration is awaiting Warden approval. Please wait for the Warden to accept your request.');
    }
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
 * @desc    Logout (Client token revocation / audit log)
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
});

/**
 * @desc    Register a new user account (Student, Parent, Warden, Guard)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    mobile,
    enrollmentNo,
    roomNo,
    department,
    block,
    gateNumber,
    parentName,
    parentMobile,
    parentEmail,
  } = req.body;

  if (!name || !email || !password || !role) {
    throw ApiError.badRequest('Name, email, password, and role are required.');
  }

  const cleanEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    throw ApiError.conflict('An account with this email address already exists.');
  }

  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    password,
    role,
    mobile: (mobile || '').trim(),
    status: role === ROLES.STUDENT ? 'pending_approval' : 'active',
  });

  // Specialized role persistence in MongoDB
  if (role === ROLES.STUDENT) {
    const cleanEnrollment = (enrollmentNo || `EN${Date.now().toString().slice(-6)}`).toUpperCase().trim();

    // Check duplicate enrollment
    const existingEnrollment = await Student.findOne({ enrollmentNo: cleanEnrollment });
    if (existingEnrollment) {
      throw ApiError.conflict(`Enrollment number ${cleanEnrollment} is already registered.`);
    }

    let linkedParentUser = null;

    // Dynamically generate parent credentials & account if parent email provided
    if (parentEmail && parentEmail.trim()) {
      const cleanParentEmail = parentEmail.toLowerCase().trim();
      linkedParentUser = await User.findOne({ email: cleanParentEmail });

      if (!linkedParentUser) {
        // Dynamically create real Parent account in MongoDB
        const generatedParentPass = `Parent@${cleanEnrollment}`;
        linkedParentUser = await User.create({
          name: (parentName || 'Parent / Guardian').trim(),
          email: cleanParentEmail,
          password: generatedParentPass,
          role: ROLES.PARENT,
          mobile: (parentMobile || '').trim(),
          status: 'active',
          metadata: {
            tempCredentials: true,
            defaultPassword: generatedParentPass,
            studentEnrollment: cleanEnrollment,
          },
        });
      }
    }

    const studentRecord = await Student.create({
      userId: user._id,
      enrollmentNo: cleanEnrollment,
      roomNo: (roomNo || 'Unassigned').trim(),
      block: (block || 'Block A').trim(),
      department: (department || 'Engineering').trim(),
      hostelStatus: HOSTEL_STATUS.PRESENT,
      parentName: (parentName || '').trim(),
      parentEmail: (parentEmail || '').toLowerCase().trim(),
      parentMobile: (parentMobile || '').trim(),
      parentUserId: linkedParentUser ? linkedParentUser._id : null,
      approvalStatus: 'PENDING',
    });

    // Create real Warden Notification in MongoDB for real student registration request
    await Notification.create({
      userId: null,
      role: ROLES.WARDEN,
      title: 'New Student Registration Request',
      message: `${user.name} (${cleanEnrollment}) has registered and is awaiting your approval to access the student portal.`,
      type: NOTIFICATION_TYPES.SYSTEM,
      requestId: studentRecord._id.toString(),
      time: 'Just now',
    });

    // Create real Activity audit entry in MongoDB
    await Activity.create({
      studentName: user.name,
      enrollmentNo: cleanEnrollment,
      roomNo: studentRecord.roomNo,
      type: 'REGISTRATION_PENDING',
      title: 'Student Registration Pending',
      description: `${user.name} registered. Awaiting Warden approval.`,
      badgeType: 'warning',
      status: 'PENDING',
    });
  } else if (role === ROLES.PARENT) {
    // If student enrollment or email was provided, link to Student
    if (enrollmentNo) {
      const cleanEnrollment = enrollmentNo.toUpperCase().trim();
      const student = await Student.findOne({ enrollmentNo: cleanEnrollment });
      if (student) {
        student.parentUserId = user._id;
        if (!student.parentName) student.parentName = user.name;
        if (!student.parentEmail) student.parentEmail = user.email;
        if (!student.parentMobile && user.mobile) student.parentMobile = user.mobile;
        await student.save();
      }
    }
  } else if (role === ROLES.GUARD) {
    await Guard.create({
      userId: user._id,
      guardId: `GRD-${Date.now().toString().slice(-4)}`,
      name: user.name,
      mobile: user.mobile,
      gateNumber: (gateNumber || 'Main Gate 1').trim(),
      shift: 'Day Shift (06:00 AM - 02:00 PM)',
      onDuty: true,
    });
  } else if (role === ROLES.WARDEN) {
    user.metadata = {
      block: block || 'Block A & B (Chief Warden)',
      office: 'Admin Wing, Ground Floor',
    };
    await user.save({ validateBeforeSave: false });
  }

  if (role === ROLES.STUDENT) {
    return res.status(201).json(
      ApiResponse.created(
        {
          pendingApproval: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
        },
        'Registration submitted successfully! Your account is pending Warden approval. You can access the student section once the Warden accepts your request.'
      )
    );
  }

  const token = generateToken({ id: user._id, role: user.role });
  const userProfile = await buildUserProfile(user);

  res.status(201).json(
    ApiResponse.created(
      {
        user: userProfile,
        token,
      },
      'User account created successfully'
    )
  );
});
