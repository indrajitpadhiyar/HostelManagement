import { verifyToken } from '../utils/token.utils.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Student from '../models/Student.js';

/**
 * Protect middleware: Verifies JWT and attaches current user to req.user
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required. No token provided.');
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists.');
    }

    if (user.status !== 'active') {
      throw ApiError.forbidden('Your account has been deactivated or suspended.');
    }

    // Attach student profile details if role is student
    if (user.role === 'student') {
      const studentProfile = await Student.findOne({ userId: user._id });
      req.studentProfile = studentProfile;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid security token.');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session expired. Please log in again.');
    }
    throw error;
  }
});

/**
 * RBAC authorization middleware: Restricts access to specified roles
 * @param  {...string} roles - e.g. 'warden', 'guard'
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role [${req.user ? req.user.role : 'anonymous'}] is not authorized to access this resource.`
      );
    }
    next();
  };
};
