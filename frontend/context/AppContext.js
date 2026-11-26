import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { router } from 'expo-router';
import apiClient from '../services/apiClient';
import MockDataService from '../services/mockDataService';
import { ROLES, LEAVE_STATUS, HOSTEL_STATUS } from '../constants/config';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Core reactive entities (initialized with clean empty arrays - NO dummy/fake records)
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [guards, setGuards] = useState([]);
  const [attendance, setAttendance] = useState({
    date: new Date().toISOString().split('T')[0],
    records: [],
    stats: { totalDays: 0, presentDays: 0, absentDays: 0, leaveDays: 0, attendanceRate: 100 },
    today: null,
  });
  const [parents, setParents] = useState([]);
  const [wardens, setWardens] = useState([]);

  // Normalization helpers for MongoDB document schemas
  const normalizeLeave = (l) => ({
    ...l,
    id: l.leaveId || l.id || l._id?.toString(),
    _id: l._id?.toString() || l.id,
    studentId: l.studentId?._id ? l.studentId._id.toString() : (l.studentId?.toString() || l.studentId),
    studentName: l.studentName || l.studentId?.name || 'Student',
    enrollmentNo: l.enrollmentNo || l.studentId?.enrollmentNo || '',
    roomNo: l.roomNo || l.studentId?.roomNo || '',
    department: l.department || l.studentId?.department || 'Engineering',
    status: l.status || LEAVE_STATUS.PENDING_PARENT_APPROVAL,
    extensionHistory: l.extensionHistory || [],
  });

  const normalizeStudent = (s) => ({
    ...s,
    id: s.id || s._id?.toString(),
    _id: s._id?.toString() || s.id,
    name: s.name || s.userId?.name || 'Student',
    enrollmentNo: s.enrollmentNo || '',
    roomNo: s.roomNo || 'Unassigned',
    block: s.block || 'Block A',
    department: s.department || 'Engineering',
    deptCode: s.deptCode || 'ENG',
    semester: s.semester || '1st Semester',
    email: s.email || s.userId?.email || '',
    mobile: s.mobile || s.phone || s.userId?.mobile || '',
    hostelStatus: s.hostelStatus || HOSTEL_STATUS.PRESENT,
    avatar: s.avatar || s.userId?.avatar,
    academicHistory: s.academicHistory || [],
  });

  const normalizeRoom = (r) => ({
    ...r,
    id: r.id || r._id?.toString(),
    roomNo: r.roomNo,
    block: r.block || 'Block A',
    floor: r.floor || '1st Floor',
    type: r.type || 'Standard Room',
    capacity: r.capacity || 2,
    occupied: r.occupied !== undefined ? r.occupied : (r.studentIds?.length || 0),
    available: r.available !== undefined ? r.available : Math.max(0, (r.capacity || 2) - (r.studentIds?.length || 0)),
    studentIds: (r.studentIds || []).map((s) => (typeof s === 'object' && s?._id ? s._id.toString() : s.toString())),
  });

  const normalizeNotif = (n) => ({
    ...n,
    id: n.id || n._id?.toString(),
    title: n.title,
    message: n.message,
    role: n.role,
    read: Boolean(n.read),
    time: n.time || n.timestamp || 'Just now',
    type: n.type || 'info',
  });

  // Fetch real data from MongoDB backend
  const fetchBackendData = useCallback(async (user) => {
    if (!user) return;

    try {
      // 1. Fetch real leaves & notifications for all authenticated users
      const [leavesRes, notifsRes] = await Promise.all([
        apiClient.getLeaves().catch((e) => {
          console.warn('[Data Fetch] Leaves API warning:', e.message);
          return null;
        }),
        apiClient.getNotifications().catch((e) => {
          console.warn('[Data Fetch] Notifications API warning:', e.message);
          return null;
        }),
      ]);

      if (leavesRes?.leaves) {
        setLeaveRequests(leavesRes.leaves.map(normalizeLeave));
      } else if (Array.isArray(leavesRes)) {
        setLeaveRequests(leavesRes.map(normalizeLeave));
      }

      if (notifsRes?.notifications) {
        setNotifications(notifsRes.notifications.map(normalizeNotif));
      } else if (Array.isArray(notifsRes)) {
        setNotifications(notifsRes.map(normalizeNotif));
      }

      // 2. Fetch Warden & Guard administrative data
      if (user.role === ROLES.WARDEN || user.role === ROLES.GUARD) {
        const [studentsRes, roomsRes, attOverviewRes, guardDashRes] = await Promise.all([
          apiClient.getStudents().catch((e) => {
            console.warn('[Data Fetch] Students API warning:', e.message);
            return null;
          }),
          apiClient.getRooms().catch((e) => {
            console.warn('[Data Fetch] Rooms API warning:', e.message);
            return null;
          }),
          apiClient.getAttendanceOverview().catch((e) => {
            console.warn('[Data Fetch] Attendance Overview API warning:', e.message);
            return null;
          }),
          user.role === ROLES.GUARD
            ? apiClient.getGuardDashboard().catch(() => null)
            : Promise.resolve(null),
        ]);

        if (Array.isArray(studentsRes)) {
          setStudents(studentsRes.map(normalizeStudent));
        } else if (studentsRes?.students) {
          setStudents(studentsRes.students.map(normalizeStudent));
        }

        if (Array.isArray(roomsRes)) {
          setRooms(roomsRes.map(normalizeRoom));
        } else if (roomsRes?.rooms) {
          setRooms(roomsRes.rooms.map(normalizeRoom));
        }

        if (attOverviewRes?.overview) {
          setAttendance(attOverviewRes.overview);
        } else if (attOverviewRes) {
          setAttendance((prev) => ({ ...prev, ...attOverviewRes }));
        }

        if (guardDashRes?.recentMovements) {
          setActivities(guardDashRes.recentMovements);
        }
      }

      // 3. Fetch Student & Parent attendance records
      if (user.role === ROLES.STUDENT || user.role === ROLES.PARENT) {
        const studentId = user.studentId || user.id;
        const studentAtt = await apiClient.getStudentAttendance(studentId).catch(() => null);
        if (studentAtt) {
          setAttendance(studentAtt);
        }
      }
    } catch (err) {
      console.warn('Backend sync encountered an issue:', err.message);
    }
  }, []);

  // Initialize and load saved session from local storage, then verify with backend
  useEffect(() => {
    async function init() {
      try {
        const storedUser = await MockDataService.getStoredSession();
        if (storedUser) {
          setCurrentUser(storedUser);
          await fetchBackendData(storedUser);
        }
      } catch (err) {
        console.error('Failed to init app state:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [fetchBackendData]);

  // Real Authentication via Backend API & MongoDB
  const login = async (identifier, password, requestedRole) => {
    const raw = (identifier || '').trim();
    if (!raw) {
      return { success: false, message: 'Please enter your login email, roll number, or ID.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your account password.' };
    }

    try {
      const res = await apiClient.login(raw, password);

      if (!res?.user) {
        return { success: false, message: 'Login failed. Invalid response from server.' };
      }

      const user = res.user;
      setCurrentUser(user);
      await MockDataService.saveSession(user);

      // Fetch real data from MongoDB for this authenticated user
      await fetchBackendData(user);

      // Route strictly to role dashboard
      const roleHomeMap = {
        [ROLES.STUDENT]: '/(student)/dashboard',
        [ROLES.PARENT]: '/(parent)/dashboard',
        [ROLES.WARDEN]: '/(warden)/dashboard',
        [ROLES.GUARD]: '/(guard)/dashboard',
      };

      router.replace(roleHomeMap[user.role] || '/(auth)/login');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed. Please verify your credentials or server connection.',
      };
    }
  };

  // Real Account Registration via Backend API & MongoDB
  const register = async (userData) => {
    const { name, email, password, role } = userData;

    if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
      return { success: false, message: 'Please complete all required fields.' };
    }

    try {
      const res = await apiClient.register(userData);

      if (res?.pendingApproval) {
        return {
          success: true,
          pendingApproval: true,
          message:
            res.message ||
            'Registration submitted successfully! Your account is awaiting Warden approval. You can access the student section once the Warden accepts your request.',
        };
      }

      if (!res?.user) {
        return { success: false, message: 'Registration failed. Unexpected response from server.' };
      }

      const user = res.user;
      setCurrentUser(user);
      await MockDataService.saveSession(user);

      // Fetch real fresh data
      await fetchBackendData(user);

      const roleHomeMap = {
        [ROLES.STUDENT]: '/(student)/dashboard',
        [ROLES.PARENT]: '/(parent)/dashboard',
        [ROLES.WARDEN]: '/(warden)/dashboard',
        [ROLES.GUARD]: '/(guard)/dashboard',
      };

      router.replace(roleHomeMap[user.role] || '/(auth)/login');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed. Please check your details and try again.',
      };
    }
  };

  // Real Logout
  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (e) {
      console.warn('Logout API error:', e.message);
    } finally {
      setCurrentUser(null);
      setStudents([]);
      setRooms([]);
      setLeaveRequests([]);
      setActivities([]);
      setNotifications([]);
      setGuards([]);
      setAttendance({
        date: new Date().toISOString().split('T')[0],
        records: [],
        stats: { totalDays: 0, presentDays: 0, absentDays: 0, leaveDays: 0, attendanceRate: 100 },
        today: null,
      });
      await MockDataService.clearSession();
      router.replace('/(auth)/login');
    }
  };

  // --- Real Leave Workflows with Backend API & MongoDB ---

  const submitLeaveRequest = async (leaveData) => {
    try {
      const payload = {
        reason: leaveData.reason,
        detailedExplanation: leaveData.detailedExplanation || '',
        destinationAddress: leaveData.destinationAddress,
        destinationCity: leaveData.destinationCity,
        departureDate: leaveData.departureDate,
        expectedReturnDate: leaveData.expectedReturnDate,
        emergencyContact: leaveData.emergencyContact,
      };

      const res = await apiClient.applyLeave(payload);
      if (res?.leave) {
        const normalized = normalizeLeave(res.leave);
        setLeaveRequests((prev) => [normalized, ...prev.filter((l) => l.id !== normalized.id)]);
        return normalized;
      }
      await fetchBackendData(currentUser);
      return res;
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      throw err;
    }
  };

  const parentApproveLeave = async (requestId, comment = 'Approved by Parent') => {
    try {
      const res = await apiClient.parentDecision(requestId, true, comment);
      if (res?.leave) {
        const normalized = normalizeLeave(res.leave);
        setLeaveRequests((prev) => prev.map((l) => (l.id === requestId ? normalized : l)));
      } else {
        await fetchBackendData(currentUser);
      }
    } catch (err) {
      console.error('Failed to approve leave by parent:', err);
      throw err;
    }
  };

  const parentRejectLeave = async (requestId, reason = 'Declined by parent') => {
    try {
      const res = await apiClient.parentDecision(requestId, false, reason);
      if (res?.leave) {
        const normalized = normalizeLeave(res.leave);
        setLeaveRequests((prev) => prev.map((l) => (l.id === requestId ? normalized : l)));
      } else {
        await fetchBackendData(currentUser);
      }
    } catch (err) {
      console.error('Failed to reject leave by parent:', err);
      throw err;
    }
  };

  const wardenApproveLeave = async (requestId, comment = 'Warden clearance approved') => {
    try {
      const res = await apiClient.wardenDecision(requestId, true, comment);
      if (res?.leave) {
        const normalized = normalizeLeave(res.leave);
        setLeaveRequests((prev) => prev.map((l) => (l.id === requestId ? normalized : l)));
      } else {
        await fetchBackendData(currentUser);
      }
    } catch (err) {
      console.error('Failed to approve leave by warden:', err);
      throw err;
    }
  };

  const wardenRejectLeave = async (requestId, reason = 'Warden declined clearance') => {
    try {
      const res = await apiClient.wardenDecision(requestId, false, reason);
      if (res?.leave) {
        const normalized = normalizeLeave(res.leave);
        setLeaveRequests((prev) => prev.map((l) => (l.id === requestId ? normalized : l)));
      } else {
        await fetchBackendData(currentUser);
      }
    } catch (err) {
      console.error('Failed to reject leave by warden:', err);
      throw err;
    }
  };

  const recordGateExit = async (requestId, remarks = 'Gate exit cleared', gateNumber = 'Main Gate 1') => {
    try {
      const res = await apiClient.recordGateExit(requestId, remarks, gateNumber);
      if (res?.leave) {
        const normalized = normalizeLeave(res.leave);
        setLeaveRequests((prev) => prev.map((l) => (l.id === requestId ? normalized : l)));
      }
      await fetchBackendData(currentUser);
      return res;
    } catch (err) {
      console.error('Failed to record gate exit:', err);
      throw err;
    }
  };

  const recordGateReturn = async (requestId, remarks = 'Gate return verified', gateNumber = 'Main Gate 1') => {
    try {
      const res = await apiClient.recordGateReturn(requestId, remarks, gateNumber);
      if (res?.leave) {
        const normalized = normalizeLeave(res.leave);
        setLeaveRequests((prev) => prev.map((l) => (l.id === requestId ? normalized : l)));
      }
      await fetchBackendData(currentUser);
      return res;
    } catch (err) {
      console.error('Failed to record gate return:', err);
      throw err;
    }
  };

  const submitLeaveExtension = async (requestId, newReturnDate, reason) => {
    try {
      const res = await apiClient.requestExtension(requestId, newReturnDate, reason);
      if (res?.leave) {
        const normalized = normalizeLeave(res.leave);
        setLeaveRequests((prev) => prev.map((l) => (l.id === requestId ? normalized : l)));
      } else {
        await fetchBackendData(currentUser);
      }
      return res;
    } catch (err) {
      console.error('Failed to request leave extension:', err);
      throw err;
    }
  };

  const parentApproveExtension = async (requestId) => {
    try {
      return await parentApproveLeave(requestId, 'Extension approved by parent');
    } catch (err) {
      console.error('Failed to approve extension:', err);
      throw err;
    }
  };

  const parentRejectExtension = async (requestId, reason) => {
    try {
      return await parentRejectLeave(requestId, reason || 'Extension declined by parent');
    } catch (err) {
      console.error('Failed to reject extension:', err);
      throw err;
    }
  };

  // --- Real Student Management ---

  const addStudent = async (studentData) => {
    try {
      const res = await apiClient.createStudent(studentData);
      if (res?.student) {
        const normalized = normalizeStudent(res.student);
        setStudents((prev) => [normalized, ...prev]);
        await fetchBackendData(currentUser);
        return normalized;
      }
      await fetchBackendData(currentUser);
      return res;
    } catch (err) {
      console.error('Failed to create student:', err);
      throw err;
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      await apiClient.deleteStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId && s._id !== studentId));
      await fetchBackendData(currentUser);
    } catch (err) {
      console.error('Failed to delete student:', err);
      throw err;
    }
  };

  const allocateRoom = async (studentId, newRoomNo) => {
    try {
      await apiClient.reallocateRoom(studentId, newRoomNo);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId || s._id === studentId ? { ...s, roomNo: newRoomNo } : s))
      );
      await fetchBackendData(currentUser);
    } catch (err) {
      console.error('Failed to reallocate room:', err);
      throw err;
    }
  };

  const updateStudentProfile = (studentId, updatedFields) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId || s._id === studentId ? { ...s, ...updatedFields } : s))
    );
    if (currentUser && (currentUser.id === studentId || currentUser.studentId === studentId)) {
      const updatedUser = { ...currentUser, ...updatedFields };
      setCurrentUser(updatedUser);
      MockDataService.saveSession(updatedUser);
    }
  };

  // --- Real Attendance ---

  const markRollCall = async (studentId, status, session = 'NIGHT_ROLL_CALL', remarks = '') => {
    const todayDate = new Date().toISOString().split('T')[0];
    try {
      await apiClient.markAttendance({
        date: todayDate,
        records: [{ studentId, status, session, remarks }],
      });
      await fetchBackendData(currentUser);
    } catch (err) {
      console.error('Failed to mark roll call:', err);
      throw err;
    }
  };

  const saveBatchRollCall = async (rollCallMap, date, session = 'NIGHT_ROLL_CALL') => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const records = Object.entries(rollCallMap).map(([studentId, entry]) => ({
      studentId,
      status: entry.status,
      session,
      remarks: entry.remarks || 'Roll-call verified',
    }));

    try {
      const res = await apiClient.markAttendance({
        date: targetDate,
        records,
      });

      const presentCount = records.filter((r) => r.status === 'PRESENT').length;
      const leaveCount = records.filter((r) => r.status === 'ON_LEAVE').length;
      const absentCount = records.filter((r) => r.status === 'ABSENT').length;

      await fetchBackendData(currentUser);
      return { success: true, presentCount, leaveCount, absentCount, res };
    } catch (err) {
      console.error('Failed to save batch roll call:', err);
      throw err;
    }
  };

  const getDayAttendance = async (date) => {
    try {
      return await apiClient.getDayAttendance(date);
    } catch (err) {
      console.warn('Failed to load day attendance:', err);
      return null;
    }
  };

  const getMonthlyAttendance = async (month) => {
    try {
      return await apiClient.getMonthlyAttendance(month);
    } catch (err) {
      console.warn('Failed to load monthly attendance:', err);
      return null;
    }
  };

  const approveStudentRegistration = async (studentId) => {
    try {
      const res = await apiClient.approveStudent(studentId);
      await fetchBackendData(currentUser);
      return { success: true, student: res };
    } catch (err) {
      console.error('Failed to approve student registration:', err);
      throw err;
    }
  };

  const rejectStudentRegistration = async (studentId, reason = '') => {
    try {
      const res = await apiClient.rejectStudent(studentId, reason);
      await fetchBackendData(currentUser);
      return { success: true, student: res };
    } catch (err) {
      console.error('Failed to reject student registration:', err);
      throw err;
    }
  };

  // --- Guard & Notifications ---

  const toggleGuardDuty = (guardId) => {
    setGuards((prev) =>
      prev.map((g) => (g.id === guardId ? { ...g, status: g.status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY' } : g))
    );
  };

  const addGuard = (guardData) => {
    setGuards((prev) => [guardData, ...prev]);
  };

  const markNotificationAsRead = (notifId) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const resetDemoData = async () => {
    await MockDataService.clearAll();
    setStudents([]);
    setRooms([]);
    setLeaveRequests([]);
    setActivities([]);
    setNotifications([]);
    setGuards([]);
  };

  // Real-Time Statistics derived strictly from real database records with current dynamic dates
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalStudents = students.length;
    const presentInHostel = students.filter((s) => s.hostelStatus === HOSTEL_STATUS.PRESENT).length;
    const currentlyOutside = students.filter((s) => s.hostelStatus === HOSTEL_STATUS.OUTSIDE).length;

    const pendingApprovals = leaveRequests.filter(
      (r) => r.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL || r.status === LEAVE_STATUS.PARENT_APPROVED
    ).length;

    const expectedReturnsToday = leaveRequests.filter(
      (r) => r.status === LEAVE_STATUS.CHECKED_OUT && r.expectedReturnDate === todayStr
    ).length;

    const overdueStudents = leaveRequests.filter(
      (r) => r.status === LEAVE_STATUS.CHECKED_OUT && r.expectedReturnDate < todayStr
    ).length;

    const approvedLeavesToday = leaveRequests.filter(
      (r) => r.status === LEAVE_STATUS.WARDEN_APPROVED || r.status === LEAVE_STATUS.PARENT_APPROVED
    ).length;

    return {
      totalStudents,
      presentInHostel,
      currentlyOutside,
      pendingApprovals,
      expectedReturnsToday,
      overdueStudents,
      approvedLeavesToday,
    };
  }, [students, leaveRequests]);

  const value = {
    isLoading,
    currentUser,
    login,
    register,
    logout,
    students,
    rooms,
    leaveRequests,
    activities,
    notifications,
    guards,
    parents,
    wardens,
    stats,
    attendance,
    markRollCall,
    saveBatchRollCall,
    getDayAttendance,
    getMonthlyAttendance,
    // Real Workflows
    submitLeaveRequest,
    parentApproveLeave,
    parentRejectLeave,
    wardenApproveLeave,
    wardenRejectLeave,
    recordGateExit,
    recordGateReturn,
    submitLeaveExtension,
    parentApproveExtension,
    parentRejectExtension,
    // Real Student & Room management
    updateStudentProfile,
    addStudent,
    deleteStudent,
    allocateRoom,
    approveStudentRegistration,
    rejectStudentRegistration,
    // Guard & Notifications
    toggleGuardDuty,
    addGuard,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetDemoData,
    fetchBackendData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
