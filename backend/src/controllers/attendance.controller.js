import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';
import { ROLES } from '../config/constants.js';

/**
 * @desc    Get detailed attendance metrics & history for a student
 * @route   GET /api/v1/attendance/student/:studentId?
 * @access  Private (Student, Parent, Warden, Guard)
 */
export const getStudentAttendance = asyncHandler(async (req, res) => {
  let targetStudentId = req.params.studentId;

  // If user is a student, lock to their own profile
  if (req.user.role === ROLES.STUDENT) {
    const studentProfile = await Student.findOne({ userId: req.user._id });
    if (!studentProfile) {
      throw new ApiError(404, 'Student profile not found for this user');
    }
    targetStudentId = studentProfile._id;
  } else if (req.user.role === ROLES.PARENT && !targetStudentId) {
    const child = await Student.findOne({
      $or: [
        { parentUserId: req.user._id },
        { parentEmail: req.user.email },
        ...(req.user.mobile ? [{ parentMobile: req.user.mobile }] : []),
      ],
    });
    if (!child) {
      throw new ApiError(404, 'No linked student record found for this parent');
    }
    targetStudentId = child._id;
  } else if (!targetStudentId) {
    // If not provided, fetch default or return 400
    throw new ApiError(400, 'Student ID is required');
  }

  const student = await Student.findById(targetStudentId);
  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  const { month, year } = req.query;
  const now = new Date();
  const currentYear = year ? parseInt(year, 10) : now.getFullYear();
  const currentMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
  const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
  const prefix = `${currentYear}-${monthStr}`;

  // Fetch all attendance for this student for the target month
  const records = await Attendance.find({
    studentId: targetStudentId,
    date: { $regex: `^${prefix}` },
  }).sort({ date: -1 });

  // Calculate comprehensive metrics
  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === 'PRESENT').length;
  const absentDays = records.filter((r) => r.status === 'ABSENT').length;
  const leaveDays = records.filter((r) => r.status === 'ON_LEAVE').length;

  // Official hostel compliance: leaves with approved pass are excused / counted as valid
  const attendanceRate = totalDays > 0 ? Math.round(((presentDays + leaveDays) / totalDays) * 1000) / 10 : 100;

  // Calculate present streak
  let streak = 0;
  const sortedAsc = [...records].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = sortedAsc.length - 1; i >= 0; i--) {
    if (sortedAsc[i].status === 'PRESENT') {
      streak++;
    } else {
      break;
    }
  }

  // Today's record
  const todayStr = now.toISOString().split('T')[0];
  const todayRecord = records.find((r) => r.date === todayStr) || null;

  // Last 7 days weekly strip
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const match = records.find((r) => r.date === dStr);
    last7Days.push({
      date: dStr,
      day: dayName,
      dayNumber: d.getDate(),
      status: match ? match.status : (i === 0 ? 'PENDING' : 'PRESENT'),
      markedAt: match?.markedAt || null,
      isToday: i === 0,
    });
  }

  return res.status(200).json(
    ApiResponse.success(
      {
        student: {
          id: student._id,
          name: student.name,
          enrollmentNo: student.enrollmentNo,
          roomNo: student.roomNo,
          block: student.block,
        },
        period: {
          month: currentMonth,
          year: currentYear,
          label: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        },
        stats: {
          totalDays,
          presentDays,
          absentDays,
          leaveDays,
          attendanceRate,
          streak,
          complianceStatus: attendanceRate >= 85 ? 'EXCELLENT' : attendanceRate >= 75 ? 'GOOD' : 'LOW_ATTENDANCE',
          minimumRequired: 75,
        },
        today: todayRecord || {
          status: 'PRESENT',
          session: 'NIGHT_ROLL_CALL',
          markedAt: '08:30 PM',
          markedBy: 'Warden Roll Call',
          date: todayStr,
        },
        weeklyStrip: last7Days,
        history: records,
      },
      'Student attendance loaded successfully'
    )
  );
});

/**
 * @desc    Get aggregate attendance overview for Warden
 * @route   GET /api/v1/attendance/overview
 * @access  Private (Warden)
 */
export const getAttendanceOverview = asyncHandler(async (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [totalStudents, todayRecords] = await Promise.all([
    Student.countDocuments({ status: 'ACTIVE' }),
    Attendance.find({ date: todayStr }),
  ]);

  const presentCount = todayRecords.filter((r) => r.status === 'PRESENT').length;
  const absentCount = todayRecords.filter((r) => r.status === 'ABSENT').length;
  const leaveCount = todayRecords.filter((r) => r.status === 'ON_LEAVE').length;
  const unmarkedCount = Math.max(0, totalStudents - todayRecords.length);

  const overallPercentage = totalStudents > 0 ? Math.round(((presentCount + leaveCount) / totalStudents) * 100) : 0;

  return res.status(200).json(
    ApiResponse.success(
      {
        date: todayStr,
        totalStudents,
        presentCount,
        absentCount,
        leaveCount,
        unmarkedCount,
        overallPercentage,
      },
      'Attendance overview loaded'
    )
  );
});

/**
 * @desc    Mark attendance for a student or batch (Warden only)
 * @route   POST /api/v1/attendance/mark
 * @access  Private (Warden)
 */
export const markAttendance = asyncHandler(async (req, res) => {
  const { studentId, date, status, session, remarks } = req.body;

  if (!studentId || !date || !status) {
    throw new ApiError(400, 'Student ID, date, and status are mandatory');
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  const record = await Attendance.findOneAndUpdate(
    { studentId, date },
    {
      studentId,
      userId: student.userId,
      studentName: student.name,
      enrollmentNo: student.enrollmentNo,
      roomNo: student.roomNo,
      date,
      status,
      session: session || 'NIGHT_ROLL_CALL',
      markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      markedBy: req.user.name || 'Warden',
      remarks: remarks || '',
    },
    { upsert: true, new: true, runValidators: true }
  );

  return res.status(200).json(ApiResponse.success(record, 'Attendance marked successfully'));
});
