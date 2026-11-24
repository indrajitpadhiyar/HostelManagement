// Clean initial state: zero dummy attendance records
export const INITIAL_ATTENDANCE = {
  records: [],
  stats: {
    totalDays: 0,
    presentDays: 0,
    leaveDays: 0,
    absentDays: 0,
    attendanceRate: 100,
    streak: 0,
    complianceStatus: 'GOOD',
    minimumRequired: 75,
  },
  today: null,
  weeklyStrip: [],
  periodLabel: 'Current Session',
};
