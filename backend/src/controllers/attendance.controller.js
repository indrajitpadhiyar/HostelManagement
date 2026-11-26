import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';
import { Activity } from '../models/Activity.js';
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
    Student.countDocuments({ status: { $ne: 'INACTIVE' } }),
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
 * @desc    Get month-wise attendance for Warden (records grouped by day + monthly statistics)
 * @route   GET /api/v1/attendance/monthly
 * @access  Private (Warden)
 */
export const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const { month } = req.query; // format: 'YYYY-MM' (e.g. '2026-11')
  const targetMonth = month || new Date().toISOString().slice(0, 7);

  const [students, records] = await Promise.all([
    Student.find({ status: { $ne: 'INACTIVE' } }).lean(),
    Attendance.find({ date: { $regex: `^${targetMonth}` } }).sort({ date: -1 }).lean(),
  ]);

  const totalStudents = students.length;

  // Group records by date (e.g. '2026-11-26')
  const daysMap = {};
  records.forEach((rec) => {
    if (!daysMap[rec.date]) {
      daysMap[rec.date] = [];
    }
    daysMap[rec.date].push(rec);
  });

  // Calculate day-by-day summaries
  const days = Object.keys(daysMap)
    .sort((a, b) => b.localeCompare(a))
    .map((dateStr) => {
      const dayRecs = daysMap[dateStr];
      const present = dayRecs.filter((r) => r.status === 'PRESENT').length;
      const onLeave = dayRecs.filter((r) => r.status === 'ON_LEAVE').length;
      const absent = dayRecs.filter((r) => r.status === 'ABSENT').length;
      const late = dayRecs.filter((r) => r.status === 'LATE').length;
      const totalMarked = dayRecs.length;
      const rate = totalMarked > 0 ? Math.round(((present + onLeave) / totalMarked) * 100) : 0;

      return {
        date: dateStr,
        totalMarked,
        totalStudents,
        present,
        onLeave,
        absent,
        late,
        rate,
        records: dayRecs,
      };
    });

  // Calculate month-wide metrics
  const totalDaysRecorded = days.length;
  const totalPresent = records.filter((r) => r.status === 'PRESENT').length;
  const totalOnLeave = records.filter((r) => r.status === 'ON_LEAVE').length;
  const totalAbsent = records.filter((r) => r.status === 'ABSENT').length;
  const averageRate =
    totalDaysRecorded > 0
      ? Math.round(days.reduce((acc, d) => acc + d.rate, 0) / totalDaysRecorded)
      : 100;

  return res.status(200).json(
    ApiResponse.success(
      {
        month: targetMonth,
        totalStudents,
        totalDaysRecorded,
        averageRate,
        totalPresent,
        totalOnLeave,
        totalAbsent,
        days,
        records,
      },
      'Monthly attendance loaded successfully'
    )
  );
});

/**
 * @desc    Get attendance records for a specific day (or today if omitted)
 * @route   GET /api/v1/attendance/day
 * @access  Private (Warden)
 */
export const getDayAttendance = asyncHandler(async (req, res) => {
  const targetDate = req.query.date || new Date().toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = targetDate === todayStr;

  const [students, records] = await Promise.all([
    Student.find({ status: { $ne: 'INACTIVE' } }).lean(),
    Attendance.find({ date: targetDate }).lean(),
  ]);

  const totalStudents = students.length;
  const isSaved = records.length > 0;

  const present = records.filter((r) => r.status === 'PRESENT').length;
  const onLeave = records.filter((r) => r.status === 'ON_LEAVE').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const late = records.filter((r) => r.status === 'LATE').length;
  const rate = records.length > 0 ? Math.round(((present + onLeave) / records.length) * 100) : 0;

  return res.status(200).json(
    ApiResponse.success(
      {
        date: targetDate,
        isToday,
        isSaved,
        totalStudents,
        present,
        onLeave,
        absent,
        late,
        rate,
        records,
      },
      'Day attendance loaded'
    )
  );
});

/**
 * @desc    Mark attendance for a student or batch (Warden only)
 * @route   POST /api/v1/attendance/mark
 * @access  Private (Warden)
 */
export const markAttendance = asyncHandler(async (req, res) => {
  const { studentId, date, status, session, remarks, records } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];
  const currentSession = session || 'NIGHT_ROLL_CALL';
  const wardenName = req.user?.name || 'Warden';

  // Handle batch attendance save
  if (Array.isArray(records) && records.length > 0) {
    const studentIds = records.map((r) => r.studentId);
    const students = await Student.find({ _id: { $in: studentIds } });
    const studentMap = {};
    students.forEach((s) => {
      studentMap[s._id.toString()] = s;
    });

    const operations = records.map((entry) => {
      const student = studentMap[entry.studentId];
      return {
        updateOne: {
          filter: { studentId: entry.studentId, date: targetDate },
          update: {
            $set: {
              studentId: entry.studentId,
              userId: student?.userId || null,
              studentName: student?.name || entry.studentName || 'Student',
              enrollmentNo: student?.enrollmentNo || entry.enrollmentNo || '',
              roomNo: student?.roomNo || entry.roomNo || '',
              date: targetDate,
              status: entry.status || 'PRESENT',
              session: entry.session || currentSession,
              markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              markedBy: wardenName,
              remarks: entry.remarks || '',
            },
          },
          upsert: true,
        },
      };
    });

    await Attendance.bulkWrite(operations);

    const savedRecords = await Attendance.find({ date: targetDate });
    const presentCount = savedRecords.filter((r) => r.status === 'PRESENT').length;
    const leaveCount = savedRecords.filter((r) => r.status === 'ON_LEAVE').length;
    const absentCount = savedRecords.filter((r) => r.status === 'ABSENT').length;

    // Log real Activity audit in MongoDB
    await Activity.create({
      studentName: 'Entire Hostel',
      enrollmentNo: 'ALL',
      roomNo: 'Hostel Wings',
      type: 'ROLL_CALL_SAVED',
      title: 'Daily Roll-Call Saved',
      description: `Roll-call saved for ${targetDate} (${presentCount} Present, ${leaveCount} On Leave, ${absentCount} Absent).`,
      badgeType: 'success',
      status: 'VERIFIED',
    }).catch(() => {});

    return res.status(200).json(
      ApiResponse.success(
        {
          date: targetDate,
          total: savedRecords.length,
          present: presentCount,
          leave: leaveCount,
          absent: absentCount,
          records: savedRecords,
        },
        `Attendance for ${targetDate} saved successfully`
      )
    );
  }

  // Handle single student marking
  if (!studentId || !status) {
    throw new ApiError(400, 'Student ID and status are mandatory');
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  const record = await Attendance.findOneAndUpdate(
    { studentId, date: targetDate },
    {
      studentId,
      userId: student.userId,
      studentName: student.name,
      enrollmentNo: student.enrollmentNo,
      roomNo: student.roomNo,
      date: targetDate,
      status,
      session: currentSession,
      markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      markedBy: wardenName,
      remarks: remarks || '',
    },
    { upsert: true, new: true, runValidators: true }
  );

  return res.status(200).json(ApiResponse.success(record, 'Attendance marked successfully'));
});
