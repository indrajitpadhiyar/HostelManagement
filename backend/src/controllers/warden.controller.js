import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { Student } from '../models/Student.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Activity } from '../models/Activity.js';
import { Guard } from '../models/Guard.js';
import { Room } from '../models/Room.js';
import { HOSTEL_STATUS, LEAVE_STATUS } from '../config/constants.js';

/**
 * @desc    Get real-time Warden Dashboard metrics and summary feeds
 * @route   GET /api/v1/warden/dashboard
 * @access  Private (Warden only)
 */
export const getWardenDashboard = asyncHandler(async (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Parallelized analytical aggregation
  const [
    totalStudents,
    inHostel,
    outsideHostel,
    pendingWardenApprovals,
    pendingParentApprovals,
    activeLeaves,
    overdueLeavesCount,
    guardsOnDuty,
    recentLeaves,
    recentActivities,
    roomsSummary,
  ] = await Promise.all([
    Student.countDocuments({ status: 'ACTIVE' }),
    Student.countDocuments({ status: 'ACTIVE', hostelStatus: HOSTEL_STATUS.PRESENT }),
    Student.countDocuments({ status: 'ACTIVE', hostelStatus: HOSTEL_STATUS.OUTSIDE }),
    LeaveRequest.countDocuments({ status: LEAVE_STATUS.PARENT_APPROVED }),
    LeaveRequest.countDocuments({ status: LEAVE_STATUS.PENDING_PARENT_APPROVAL }),
    LeaveRequest.countDocuments({ status: LEAVE_STATUS.CHECKED_OUT }),
    LeaveRequest.countDocuments({
      status: LEAVE_STATUS.CHECKED_OUT,
      expectedReturnDate: { $lt: todayStr },
    }),
    Guard.countDocuments({ onDuty: true }),
    LeaveRequest.find({
      status: { $in: [LEAVE_STATUS.PARENT_APPROVED, LEAVE_STATUS.PENDING_PARENT_APPROVAL] },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('studentId', 'name enrollmentNo roomNo department phone avatar'),
    Activity.find().sort({ createdAt: -1 }).limit(10),
    Room.aggregate([
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalOccupied: { $sum: '$occupied' },
          totalAvailable: { $sum: '$available' },
        },
      },
    ]),
  ]);

  const roomStats = roomsSummary[0] || {
    totalRooms: 0,
    totalCapacity: 0,
    totalOccupied: 0,
    totalAvailable: 0,
  };

  return res.status(200).json(
    ApiResponse.success(
      {
        kpis: {
          totalStudents,
          inHostel,
          outsideHostel,
          pendingWardenApprovals,
          pendingParentApprovals,
          activeLeaves,
          overdueLeavesCount,
          guardsOnDuty,
          occupancyRate: roomStats.totalCapacity
            ? Math.round((roomStats.totalOccupied / roomStats.totalCapacity) * 100)
            : 0,
          roomStats,
        },
        actionItems: {
          pendingLeaves: recentLeaves,
        },
        recentActivities,
      },
      'Warden dashboard data loaded successfully'
    )
  );
});

/**
 * @desc    Get aggregated leave, attendance, and compliance reports
 * @route   GET /api/v1/warden/reports
 * @access  Private (Warden only)
 */
export const getReports = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  const today = new Date();
  let startDate = new Date();
  if (period === 'week') {
    startDate.setDate(today.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(today.getMonth() - 1);
  } else if (period === 'year') {
    startDate.setFullYear(today.getFullYear() - 1);
  } else {
    startDate = new Date(0); // all time
  }

  const [statusDistribution, reasonBreakdown, departmentMovement, overdueList] =
    await Promise.all([
      LeaveRequest.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      LeaveRequest.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$leaveType', count: { $sum: 1 } } },
      ]),
      LeaveRequest.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student',
          },
        },
        { $unwind: '$student' },
        { $group: { _id: '$student.department', count: { $sum: 1 } } },
      ]),
      LeaveRequest.find({
        status: LEAVE_STATUS.CHECKED_OUT,
        expectedReturnDate: { $lt: today.toISOString().split('T')[0] },
      }).populate('studentId', 'name enrollmentNo roomNo phone parentContact'),
    ]);

  return res.status(200).json(
    ApiResponse.success(
      {
        period,
        statusDistribution,
        reasonBreakdown,
        departmentMovement,
        overdueCount: overdueList.length,
        overdueList,
      },
      'Reports generated successfully'
    )
  );
});

/**
 * @desc    Get paginated real-time activity log
 * @route   GET /api/v1/warden/activities
 * @access  Private (Warden, Guard)
 */
export const getActivities = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.type) {
    filter.type = req.query.type;
  }
  if (req.query.enrollmentNo) {
    filter.enrollmentNo = req.query.enrollmentNo.trim().toUpperCase();
  }

  const [activities, total] = await Promise.all([
    Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Activity.countDocuments(filter),
  ]);

  return res.status(200).json(
    ApiResponse.success(
      {
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Activities fetched successfully'
    )
  );
});

/**
 * @desc    Get all security guards roster
 * @route   GET /api/v1/warden/guards
 * @access  Private (Warden only)
 */
export const getGuards = asyncHandler(async (req, res) => {
  const guards = await Guard.find().sort({ onDuty: -1, name: 1 });
  return res.status(200).json(ApiResponse.success(guards, 'Guards roster retrieved'));
});

/**
 * @desc    Add a security guard
 * @route   POST /api/v1/warden/guards
 * @access  Private (Warden only)
 */
export const addGuard = asyncHandler(async (req, res) => {
  const { guardId, name, mobile, gateNumber, shift } = req.body;

  if (!guardId || !name) {
    throw new ApiError(400, 'Guard ID and name are mandatory fields');
  }

  const existing = await Guard.findOne({ guardId: guardId.trim().toUpperCase() });
  if (existing) {
    throw new ApiError(409, `Guard with ID ${guardId} already exists`);
  }

  const newGuard = await Guard.create({
    guardId: guardId.trim().toUpperCase(),
    name: name.trim(),
    mobile: mobile || '',
    gateNumber: gateNumber || 'Main Gate 1',
    shift: shift || 'Day Shift',
    onDuty: true,
  });

  return res.status(201).json(ApiResponse.created(newGuard, 'Guard registered successfully'));
});

/**
 * @desc    Toggle guard duty status
 * @route   PATCH /api/v1/warden/guards/:id/toggle-duty
 * @access  Private (Warden only)
 */
export const toggleGuardDuty = asyncHandler(async (req, res) => {
  const guard = await Guard.findById(req.params.id);
  if (!guard) {
    throw new ApiError(404, 'Guard not found');
  }

  guard.onDuty = !guard.onDuty;
  await guard.save();

  return res
    .status(200)
    .json(
      ApiResponse.success(
        guard,
        `Guard duty marked as ${guard.onDuty ? 'ON DUTY' : 'OFF DUTY'}`
      )
    );
});
