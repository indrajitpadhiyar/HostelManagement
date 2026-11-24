import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import MockDataService from '../services/mockDataService';
import { ROLES, LEAVE_STATUS, HOSTEL_STATUS } from '../constants/config';
import { INITIAL_STUDENTS } from '../data/students';
import { INITIAL_ROOMS } from '../data/rooms';
import { INITIAL_LEAVE_REQUESTS } from '../data/leaveRequests';
import { INITIAL_ACTIVITIES } from '../data/activities';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';
import { INITIAL_GUARDS } from '../data/guards';
import { INITIAL_PARENTS } from '../data/parents';
import { INITIAL_WARDENS } from '../data/wardens';
import { INITIAL_ATTENDANCE } from '../data/attendance';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Core reactive entities (initialized with default seed data for instant SSR & hydration safety)
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [guards, setGuards] = useState(INITIAL_GUARDS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [parents] = useState(INITIAL_PARENTS);
  const [wardens] = useState(INITIAL_WARDENS);

  // Initialize and load saved state from AsyncStorage
  useEffect(() => {
    async function init() {
      try {
        const storedUser = await MockDataService.getStoredSession();
        if (storedUser) {
          setCurrentUser(storedUser);
        }
        const data = await MockDataService.loadInitialData();
        setStudents(data.students);
        setRooms(data.rooms);
        setLeaveRequests(data.leaveRequests);
        setActivities(data.activities);
        setNotifications(data.notifications);
        setGuards(data.guards);
        if (data.attendance) {
          setAttendance(data.attendance);
        }
      } catch (err) {
        console.error('Failed to init app state:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Save changes to storage whenever major datasets mutate
  useEffect(() => {
    if (!isLoading && students.length > 0) {
      MockDataService.persistData({
        students,
        rooms,
        leaveRequests,
        activities,
        notifications,
        guards,
        attendance,
      });
    }
  }, [students, rooms, leaveRequests, activities, notifications, guards, attendance, isLoading]);

  // Auth Functions
  const login = async (email, password) => {
    const trimmed = (email || '').trim().toLowerCase();

    // Check student
    if (trimmed === 'student@hosteleasy.demo' || trimmed === 'student') {
      const student = students.find((s) => s.id === 'STU001') || students[0];
      const user = {
        id: student.id,
        role: ROLES.STUDENT,
        name: student.name,
        email: student.email,
        enrollmentNo: student.enrollmentNo,
        roomNo: student.roomNo,
        department: student.department,
        avatar: student.avatar,
      };
      setCurrentUser(user);
      await MockDataService.saveSession(user);
      router.replace('/(student)/dashboard');
      return { success: true };
    }

    // Check parent
    if (trimmed === 'parent@hosteleasy.demo' || trimmed === 'parent') {
      const parent = parents[0];
      const child = students.find((s) => s.id === parent.studentIds[0]) || students[0];
      const user = {
        id: parent.id,
        role: ROLES.PARENT,
        name: parent.name,
        email: parent.email,
        studentId: child.id,
        studentName: child.name,
        avatar: parent.avatar,
      };
      setCurrentUser(user);
      await MockDataService.saveSession(user);
      router.replace('/(parent)/dashboard');
      return { success: true };
    }

    // Check warden
    if (trimmed === 'warden@hosteleasy.demo' || trimmed === 'warden') {
      const warden = wardens[0];
      const user = {
        id: warden.id,
        role: ROLES.WARDEN,
        name: warden.name,
        email: warden.email,
        block: warden.block,
        avatar: warden.avatar,
      };
      setCurrentUser(user);
      await MockDataService.saveSession(user);
      router.replace('/(warden)/dashboard');
      return { success: true };
    }

    // Check guard
    if (trimmed === 'guard@hosteleasy.demo' || trimmed === 'guard') {
      const guard = guards[0] || { id: 'GRD001', name: 'Balwant Singh' };
      const user = {
        id: guard.id,
        role: ROLES.GUARD,
        name: guard.name,
        email: guard.email || 'guard@hosteleasy.demo',
        gateNumber: guard.gateNumber || 'Main Gate 1',
        avatar: guard.avatar,
      };
      setCurrentUser(user);
      await MockDataService.saveSession(user);
      router.replace('/(guard)/dashboard');
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid email or password. Please use demo credentials or 1-tap quick role selector.',
    };
  };

  const switchDemoRole = async (role) => {
    if (role === ROLES.STUDENT) {
      return login('student@hosteleasy.demo', 'demo123');
    }
    if (role === ROLES.PARENT) {
      return login('parent@hosteleasy.demo', 'demo123');
    }
    if (role === ROLES.WARDEN) {
      return login('warden@hosteleasy.demo', 'demo123');
    }
    if (role === ROLES.GUARD) {
      return login('guard@hosteleasy.demo', 'demo123');
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    await MockDataService.clearSession();
    router.replace('/(auth)/login');
  };

  // Helper date/time formatter
  const getNowFormatted = () => {
    const d = new Date();
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `Today, ${displayHours}:${mins} ${ampm}`;
  };

  // --- WORKFLOW: Leave Submission (Student) ---
  const submitLeaveRequest = (leaveData) => {
    const newId = `LR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const student = students.find((s) => s.id === leaveData.studentId) || students[0];

    const newRequest = {
      id: newId,
      studentId: student.id,
      studentName: student.name,
      enrollmentNo: student.enrollmentNo,
      department: student.deptCode || 'CSE',
      semester: student.semester,
      roomNo: student.roomNo,
      reason: leaveData.reason,
      detailedExplanation: leaveData.detailedExplanation || '',
      destinationAddress: leaveData.destinationAddress,
      destinationCity: leaveData.destinationCity,
      emergencyContact: leaveData.emergencyContact || student.parentMobile,
      departureDate: leaveData.departureDate,
      expectedReturnDate: leaveData.expectedReturnDate,
      actualExitTime: null,
      actualReturnTime: null,
      status: LEAVE_STATUS.PENDING_PARENT_APPROVAL,
      submittedAt: getNowFormatted(),
      parentActionAt: null,
      parentActionComment: null,
      wardenActionAt: null,
      wardenActionComment: null,
      guardExitRecordedBy: null,
      guardReturnRecordedBy: null,
      rejectionReason: null,
      extensionHistory: [],
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);

    // Add activity
    const newActivity = {
      id: `ACT-${Date.now()}`,
      studentName: student.name,
      enrollmentNo: student.enrollmentNo,
      roomNo: student.roomNo,
      type: 'LEAVE_SUBMITTED',
      title: 'New Leave Request Submitted',
      description: `Applied for leave from ${leaveData.departureDate} to ${leaveData.expectedReturnDate}.`,
      timestamp: getNowFormatted(),
      badgeType: 'info',
      status: LEAVE_STATUS.PENDING_PARENT_APPROVAL,
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Add notification for parent
    const parentNotif = {
      id: `NOTIF-${Date.now()}`,
      userId: student.parentId || 'PAR001',
      role: ROLES.PARENT,
      title: 'Action Required: New Leave Request',
      message: `${student.name} requested leave: "${leaveData.reason}". Needs your approval.`,
      timestamp: getNowFormatted(),
      read: false,
      type: 'action',
      requestId: newId,
    };
    setNotifications((prev) => [parentNotif, ...prev]);

    return newRequest;
  };

  // --- WORKFLOW: Parent Decision ---
  const parentApproveLeave = (requestId, comment = 'Approved by Parent') => {
    let updatedRequest = null;
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          updatedRequest = {
            ...req,
            status: LEAVE_STATUS.PARENT_APPROVED,
            parentActionAt: getNowFormatted(),
            parentActionComment: comment,
            rejectionReason: null,
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      // Activity
      const newActivity = {
        id: `ACT-${Date.now()}`,
        studentName: updatedRequest.studentName,
        enrollmentNo: updatedRequest.enrollmentNo,
        roomNo: updatedRequest.roomNo,
        type: 'PARENT_APPROVED',
        title: 'Parent Approval Received',
        description: `Parent authorized leave: "${updatedRequest.reason}".`,
        timestamp: getNowFormatted(),
        badgeType: 'success',
        status: LEAVE_STATUS.PARENT_APPROVED,
      };
      setActivities((prev) => [newActivity, ...prev]);

      // Notifications
      const studentNotif = {
        id: `NOTIF-${Date.now()}-1`,
        userId: updatedRequest.studentId,
        role: ROLES.STUDENT,
        title: 'Parent Approved Your Leave',
        message: 'Your parent has approved your leave. Forwarded for gate clearance.',
        timestamp: getNowFormatted(),
        read: false,
        type: 'success',
        requestId,
      };
      const wardenNotif = {
        id: `NOTIF-${Date.now()}-2`,
        userId: 'WAR001',
        role: ROLES.WARDEN,
        title: 'Parent Approved: Ready for Clearance',
        message: `${updatedRequest.studentName} received parent approval for "${updatedRequest.reason}".`,
        timestamp: getNowFormatted(),
        read: false,
        type: 'action',
        requestId,
      };
      setNotifications((prev) => [studentNotif, wardenNotif, ...prev]);
    }
  };

  const parentRejectLeave = (requestId, reason) => {
    let updatedRequest = null;
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          updatedRequest = {
            ...req,
            status: LEAVE_STATUS.PARENT_REJECTED,
            parentActionAt: getNowFormatted(),
            rejectionReason: reason || 'Declined by parent without detailed remarks.',
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      const newActivity = {
        id: `ACT-${Date.now()}`,
        studentName: updatedRequest.studentName,
        enrollmentNo: updatedRequest.enrollmentNo,
        roomNo: updatedRequest.roomNo,
        type: 'PARENT_REJECTED',
        title: 'Leave Rejected by Parent',
        description: `Parent rejected: "${reason || 'Permission denied'}".`,
        timestamp: getNowFormatted(),
        badgeType: 'danger',
        status: LEAVE_STATUS.PARENT_REJECTED,
      };
      setActivities((prev) => [newActivity, ...prev]);

      const studentNotif = {
        id: `NOTIF-${Date.now()}`,
        userId: updatedRequest.studentId,
        role: ROLES.STUDENT,
        title: 'Leave Request Declined',
        message: `Your parent rejected your leave: "${reason || 'Permission denied'}".`,
        timestamp: getNowFormatted(),
        read: false,
        type: 'error',
        requestId,
      };
      setNotifications((prev) => [studentNotif, ...prev]);
    }
  };

  // --- WORKFLOW: Warden Decision ---
  const wardenApproveLeave = (requestId, comment = 'Warden clearance approved') => {
    let updatedRequest = null;
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          updatedRequest = {
            ...req,
            status: LEAVE_STATUS.WARDEN_APPROVED,
            wardenActionAt: getNowFormatted(),
            wardenActionComment: comment,
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      const newActivity = {
        id: `ACT-${Date.now()}`,
        studentName: updatedRequest.studentName,
        enrollmentNo: updatedRequest.enrollmentNo,
        roomNo: updatedRequest.roomNo,
        type: 'WARDEN_APPROVED',
        title: 'Warden Clearance Granted',
        description: `Authorized gate pass for ${updatedRequest.studentName}.`,
        timestamp: getNowFormatted(),
        badgeType: 'success',
        status: LEAVE_STATUS.WARDEN_APPROVED,
      };
      setActivities((prev) => [newActivity, ...prev]);

      const studentNotif = {
        id: `NOTIF-${Date.now()}-1`,
        userId: updatedRequest.studentId,
        role: ROLES.STUDENT,
        title: 'Gate Pass Granted',
        message: 'Warden has approved your gate clearance. You may exit when scheduled.',
        timestamp: getNowFormatted(),
        read: false,
        type: 'success',
        requestId,
      };
      const guardNotif = {
        id: `NOTIF-${Date.now()}-2`,
        userId: 'GRD001',
        role: ROLES.GUARD,
        title: 'Approved Exit Added',
        message: `${updatedRequest.studentName} is cleared for exit on ${updatedRequest.departureDate}.`,
        timestamp: getNowFormatted(),
        read: false,
        type: 'info',
        requestId,
      };
      setNotifications((prev) => [studentNotif, guardNotif, ...prev]);
    }
  };

  const wardenRejectLeave = (requestId, reason) => {
    let updatedRequest = null;
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          updatedRequest = {
            ...req,
            status: LEAVE_STATUS.REJECTED,
            wardenActionAt: getNowFormatted(),
            rejectionReason: reason || 'Warden declined clearance.',
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      const newActivity = {
        id: `ACT-${Date.now()}`,
        studentName: updatedRequest.studentName,
        enrollmentNo: updatedRequest.enrollmentNo,
        roomNo: updatedRequest.roomNo,
        type: 'WARDEN_REJECTED',
        title: 'Warden Rejected Leave',
        description: `Warden denied: "${reason}".`,
        timestamp: getNowFormatted(),
        badgeType: 'danger',
        status: LEAVE_STATUS.REJECTED,
      };
      setActivities((prev) => [newActivity, ...prev]);

      const studentNotif = {
        id: `NOTIF-${Date.now()}`,
        userId: updatedRequest.studentId,
        role: ROLES.STUDENT,
        title: 'Clearance Declined by Warden',
        message: `Warden rejected your leave pass: "${reason}".`,
        timestamp: getNowFormatted(),
        read: false,
        type: 'error',
        requestId,
      };
      setNotifications((prev) => [studentNotif, ...prev]);
    }
  };

  // --- WORKFLOW: Guard Gate Exit ---
  const recordGateExit = (requestId, guardName = 'Balwant Singh') => {
    let updatedRequest = null;
    const exitTimestamp = getNowFormatted();

    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          updatedRequest = {
            ...req,
            status: LEAVE_STATUS.CHECKED_OUT,
            actualExitTime: exitTimestamp,
            guardExitRecordedBy: guardName,
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      // Update student hostel status to OUTSIDE_HOSTEL
      setStudents((prev) =>
        prev.map((s) => (s.id === updatedRequest.studentId ? { ...s, hostelStatus: HOSTEL_STATUS.OUTSIDE } : s))
      );

      // Activity
      const newActivity = {
        id: `ACT-${Date.now()}`,
        studentName: updatedRequest.studentName,
        enrollmentNo: updatedRequest.enrollmentNo,
        roomNo: updatedRequest.roomNo,
        type: 'GATE_EXIT',
        title: 'Gate Exit Cleared',
        description: `Departed campus at ${exitTimestamp}. Checked by Guard ${guardName}.`,
        timestamp: exitTimestamp,
        badgeType: 'warning',
        status: LEAVE_STATUS.CHECKED_OUT,
      };
      setActivities((prev) => [newActivity, ...prev]);

      // Notifications to Parent & Warden
      const student = students.find((s) => s.id === updatedRequest.studentId);
      const parentNotif = {
        id: `NOTIF-${Date.now()}-1`,
        userId: student?.parentId || 'PAR001',
        role: ROLES.PARENT,
        title: 'Child Departed Hostel',
        message: `${updatedRequest.studentName} has checked out of hostel at ${exitTimestamp}.`,
        timestamp: exitTimestamp,
        read: false,
        type: 'info',
        requestId,
      };
      const wardenNotif = {
        id: `NOTIF-${Date.now()}-2`,
        userId: 'WAR001',
        role: ROLES.WARDEN,
        title: 'Student Exit Recorded',
        message: `${updatedRequest.studentName} checked out through Main Gate.`,
        timestamp: exitTimestamp,
        read: false,
        type: 'info',
        requestId,
      };
      setNotifications((prev) => [parentNotif, wardenNotif, ...prev]);
    }
  };

  // --- WORKFLOW: Guard Gate Return ---
  const recordGateReturn = (requestId, guardName = 'Balwant Singh') => {
    let updatedRequest = null;
    const returnTimestamp = getNowFormatted();

    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          updatedRequest = {
            ...req,
            status: LEAVE_STATUS.CHECKED_IN,
            actualReturnTime: returnTimestamp,
            guardReturnRecordedBy: guardName,
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      // Update student hostel status to PRESENT_IN_HOSTEL
      setStudents((prev) =>
        prev.map((s) => (s.id === updatedRequest.studentId ? { ...s, hostelStatus: HOSTEL_STATUS.PRESENT } : s))
      );

      // Activity
      const newActivity = {
        id: `ACT-${Date.now()}`,
        studentName: updatedRequest.studentName,
        enrollmentNo: updatedRequest.enrollmentNo,
        roomNo: updatedRequest.roomNo,
        type: 'GATE_RETURN',
        title: 'Student Returned to Hostel',
        description: `Returned safely at ${returnTimestamp}. Verified by Guard ${guardName}.`,
        timestamp: returnTimestamp,
        badgeType: 'success',
        status: LEAVE_STATUS.CHECKED_IN,
      };
      setActivities((prev) => [newActivity, ...prev]);

      // Notifications
      const student = students.find((s) => s.id === updatedRequest.studentId);
      const parentNotif = {
        id: `NOTIF-${Date.now()}-1`,
        userId: student?.parentId || 'PAR001',
        role: ROLES.PARENT,
        title: 'Child Returned Safely',
        message: `${updatedRequest.studentName} has arrived back at the hostel.`,
        timestamp: returnTimestamp,
        read: false,
        type: 'success',
        requestId,
      };
      setNotifications((prev) => [parentNotif, ...prev]);
    }
  };

  // --- WORKFLOW: Extend Leave ---
  const submitLeaveExtension = (requestId, newReturnDate, reason) => {
    let updatedRequest = null;
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const extensionRecord = {
            requestedAt: getNowFormatted(),
            oldReturnDate: req.expectedReturnDate,
            newReturnDate,
            reason,
            status: 'PENDING_PARENT_APPROVAL',
          };
          updatedRequest = {
            ...req,
            status: LEAVE_STATUS.EXTENSION_PENDING,
            extensionHistory: [...(req.extensionHistory || []), extensionRecord],
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      const newActivity = {
        id: `ACT-${Date.now()}`,
        studentName: updatedRequest.studentName,
        enrollmentNo: updatedRequest.enrollmentNo,
        roomNo: updatedRequest.roomNo,
        type: 'EXTENSION_REQUESTED',
        title: 'Leave Extension Requested',
        description: `Extension till ${newReturnDate} requested. Reason: ${reason}.`,
        timestamp: getNowFormatted(),
        badgeType: 'warning',
        status: LEAVE_STATUS.EXTENSION_PENDING,
      };
      setActivities((prev) => [newActivity, ...prev]);

      const student = students.find((s) => s.id === updatedRequest.studentId);
      const parentNotif = {
        id: `NOTIF-${Date.now()}`,
        userId: student?.parentId || 'PAR001',
        role: ROLES.PARENT,
        title: 'Action Required: Leave Extension',
        message: `${updatedRequest.studentName} requested return extension to ${newReturnDate}.`,
        timestamp: getNowFormatted(),
        read: false,
        type: 'action',
        requestId,
      };
      setNotifications((prev) => [parentNotif, ...prev]);
    }
  };

  const parentApproveExtension = (requestId) => {
    let updatedRequest = null;
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const history = [...(req.extensionHistory || [])];
          const latest = history[history.length - 1];
          const newExpectedDate = latest ? latest.newReturnDate : req.expectedReturnDate;
          if (latest) {
            history[history.length - 1] = { ...latest, status: 'APPROVED' };
          }

          updatedRequest = {
            ...req,
            expectedReturnDate: newExpectedDate,
            status: LEAVE_STATUS.EXTENSION_APPROVED,
            extensionHistory: history,
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      const newActivity = {
        id: `ACT-${Date.now()}`,
        studentName: updatedRequest.studentName,
        enrollmentNo: updatedRequest.enrollmentNo,
        roomNo: updatedRequest.roomNo,
        type: 'EXTENSION_APPROVED',
        title: 'Extension Approved by Parent',
        description: `New expected return date updated to ${updatedRequest.expectedReturnDate}.`,
        timestamp: getNowFormatted(),
        badgeType: 'success',
        status: LEAVE_STATUS.EXTENSION_APPROVED,
      };
      setActivities((prev) => [newActivity, ...prev]);

      const studentNotif = {
        id: `NOTIF-${Date.now()}-1`,
        userId: updatedRequest.studentId,
        role: ROLES.STUDENT,
        title: 'Extension Approved',
        message: `Your return date is now extended to ${updatedRequest.expectedReturnDate}.`,
        timestamp: getNowFormatted(),
        read: false,
        type: 'success',
        requestId,
      };
      const wardenNotif = {
        id: `NOTIF-${Date.now()}-2`,
        userId: 'WAR001',
        role: ROLES.WARDEN,
        title: 'Return Date Extended',
        message: `${updatedRequest.studentName} return date updated to ${updatedRequest.expectedReturnDate}.`,
        timestamp: getNowFormatted(),
        read: false,
        type: 'info',
        requestId,
      };
      setNotifications((prev) => [studentNotif, wardenNotif, ...prev]);
    }
  };

  const parentRejectExtension = (requestId, reason) => {
    let updatedRequest = null;
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const history = [...(req.extensionHistory || [])];
          if (history.length > 0) {
            history[history.length - 1] = {
              ...history[history.length - 1],
              status: 'REJECTED',
              rejectionReason: reason || 'Parent rejected extension',
            };
          }
          // Request reverts to previous active checked out or approved state
          const prevStatus = req.actualExitTime ? LEAVE_STATUS.CHECKED_OUT : LEAVE_STATUS.WARDEN_APPROVED;
          updatedRequest = {
            ...req,
            status: prevStatus,
            extensionHistory: history,
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      const newActivity = {
        id: `ACT-${Date.now()}`,
        studentName: updatedRequest.studentName,
        enrollmentNo: updatedRequest.enrollmentNo,
        roomNo: updatedRequest.roomNo,
        type: 'EXTENSION_REJECTED',
        title: 'Extension Request Rejected',
        description: `Parent declined extension: "${reason || 'Return on original date'}".`,
        timestamp: getNowFormatted(),
        badgeType: 'danger',
        status: LEAVE_STATUS.EXTENSION_REJECTED,
      };
      setActivities((prev) => [newActivity, ...prev]);

      const studentNotif = {
        id: `NOTIF-${Date.now()}`,
        userId: updatedRequest.studentId,
        role: ROLES.STUDENT,
        title: 'Extension Declined by Parent',
        message: `Extension denied: "${reason || 'Must return on original date'}".`,
        timestamp: getNowFormatted(),
        read: false,
        type: 'error',
        requestId,
      };
      setNotifications((prev) => [studentNotif, ...prev]);
    }
  };

  // --- Student Management (Warden & Student Profile) ---
  const updateStudentProfile = (studentId, updatedFields) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, ...updatedFields } : s)));
    // Also update currentUser if it's the student
    if (currentUser && currentUser.id === studentId) {
      const updatedUser = { ...currentUser, ...updatedFields };
      setCurrentUser(updatedUser);
      MockDataService.saveSession(updatedUser);
    }
  };

  const addStudent = (studentData) => {
    const newStudent = {
      id: `STU${Math.floor(100 + Math.random() * 900)}`,
      enrollmentNo: studentData.enrollmentNo,
      name: studentData.name,
      department: studentData.department,
      deptCode: studentData.deptCode || 'CSE',
      semester: studentData.semester,
      roomNo: studentData.roomNo,
      block: studentData.roomNo.startsWith('A') ? 'Block A' : 'Block B',
      email: studentData.email,
      mobile: studentData.mobile,
      parentId: 'PAR001',
      parentName: studentData.parentName,
      parentMobile: studentData.parentMobile,
      parentEmail: studentData.parentEmail || 'parent@demo.com',
      hostelStatus: HOSTEL_STATUS.PRESENT,
      admissionDate: '2024-08-01',
      bloodGroup: studentData.bloodGroup || 'O+',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      academicHistory: [
        { year: '1st Year (2024-2025)', semester: 'Sem 1 & 2', gpa: '8.5', department: studentData.deptCode, roomNo: studentData.roomNo, attendance: '95%' },
        { year: '2nd Year (2025-2026)', semester: 'Sem 3 & 4', gpa: 'Upcoming', department: studentData.deptCode, roomNo: studentData.roomNo, attendance: 'Planned' },
        { year: '3rd Year (2026-2027)', semester: 'Sem 5 & 6', gpa: 'Upcoming', department: studentData.deptCode, roomNo: 'N/A', attendance: 'Planned' },
        { year: '4th Year (2027-2028)', semester: 'Sem 7 & 8', gpa: 'Upcoming', department: studentData.deptCode, roomNo: 'N/A', attendance: 'Planned' },
        { year: '5th Year / Integrated', semester: 'Honors', gpa: 'Upcoming', department: studentData.deptCode, roomNo: 'N/A', attendance: 'Planned' },
      ],
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Update room occupancy
    setRooms((prev) =>
      prev.map((r) => {
        if (r.roomNo === studentData.roomNo) {
          const newOccupied = r.occupied + 1;
          return {
            ...r,
            occupied: newOccupied,
            available: Math.max(0, r.capacity - newOccupied),
            studentIds: [...(r.studentIds || []), newStudent.id],
          };
        }
        return r;
      })
    );

    return newStudent;
  };

  const deleteStudent = (studentId) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    // Remove from rooms
    setRooms((prev) =>
      prev.map((r) => ({
        ...r,
        studentIds: (r.studentIds || []).filter((id) => id !== studentId),
        occupied: Math.max(0, (r.studentIds || []).filter((id) => id !== studentId).length),
        available: r.capacity - Math.max(0, (r.studentIds || []).filter((id) => id !== studentId).length),
      }))
    );
  };

  // --- Room Allocation (Warden) ---
  const allocateRoom = (studentId, newRoomNo) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const oldRoomNo = student.roomNo;

    // Update student
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, roomNo: newRoomNo, block: newRoomNo.startsWith('A') ? 'Block A' : 'Block B' } : s))
    );

    // Update rooms
    setRooms((prev) =>
      prev.map((r) => {
        if (r.roomNo === oldRoomNo) {
          const updatedIds = (r.studentIds || []).filter((id) => id !== studentId);
          return {
            ...r,
            studentIds: updatedIds,
            occupied: updatedIds.length,
            available: r.capacity - updatedIds.length,
          };
        }
        if (r.roomNo === newRoomNo) {
          const updatedIds = [...(r.studentIds || []), studentId];
          return {
            ...r,
            studentIds: updatedIds,
            occupied: updatedIds.length,
            available: Math.max(0, r.capacity - updatedIds.length),
          };
        }
        return r;
      })
    );
  };

  // --- Guard Management (Warden) ---
  const toggleGuardDuty = (guardId) => {
    setGuards((prev) =>
      prev.map((g) => (g.id === guardId ? { ...g, status: g.status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY' } : g))
    );
  };

  const addGuard = (guardData) => {
    const newGuard = {
      id: `GRD${Math.floor(100 + Math.random() * 900)}`,
      name: guardData.name,
      mobile: guardData.mobile,
      email: guardData.email || 'guard@hosteleasy.demo',
      gateNumber: guardData.gateNumber || 'Main Gate 1',
      shift: guardData.shift || 'Day Shift (06:00 AM - 02:00 PM)',
      status: 'ON_DUTY',
      avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=200&auto=format&fit=crop&q=80',
    };
    setGuards((prev) => [...prev, newGuard]);
  };

  // Notifications
  const markNotificationAsRead = (notifId) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = (role) => {
    setNotifications((prev) => prev.map((n) => (n.role === role ? { ...n, read: true } : n)));
  };

  // Reset entire demo data
  const resetDemoData = async () => {
    const data = await MockDataService.resetToDefaults();
    if (data) {
      setStudents(data.students);
      setRooms(data.rooms);
      setLeaveRequests(data.leaveRequests);
      setActivities(data.activities);
      setNotifications(data.notifications);
      setGuards(data.guards);
    }
  };

  // Computed Real-Time Statistics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const presentInHostel = students.filter((s) => s.hostelStatus === HOSTEL_STATUS.PRESENT).length;
    const currentlyOutside = students.filter((s) => s.hostelStatus === HOSTEL_STATUS.OUTSIDE).length;

    const pendingApprovals = leaveRequests.filter(
      (r) => r.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL || r.status === LEAVE_STATUS.PARENT_APPROVED
    ).length;

    const expectedReturnsToday = leaveRequests.filter(
      (r) => r.status === LEAVE_STATUS.CHECKED_OUT && (r.expectedReturnDate.includes('2026-11-23') || r.expectedReturnDate.includes('2026-11-24'))
    ).length;

    // Overdue students (checked out and expected return is past or today)
    const overdueStudents = leaveRequests.filter(
      (r) => r.status === LEAVE_STATUS.CHECKED_OUT && r.expectedReturnDate < '2026-11-23'
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

  const markRollCall = (studentId, status, session = 'NIGHT_ROLL_CALL', remarks = '') => {
    setAttendance((prev) => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const todayDate = new Date().toISOString().split('T')[0];
      const existingIdx = prev.records.findIndex((r) => r.date === todayDate);

      let updatedRecords = [...prev.records];
      const newRecord = {
        id: `att-${Date.now()}`,
        date: todayDate,
        status,
        session,
        time: nowStr,
        markedBy: currentUser?.name || 'Warden',
        remarks: remarks || 'Roll-call verified',
      };

      if (existingIdx >= 0) {
        updatedRecords[existingIdx] = newRecord;
      } else {
        updatedRecords = [newRecord, ...updatedRecords];
      }

      const totalDays = updatedRecords.length;
      const presentDays = updatedRecords.filter((r) => r.status === 'PRESENT').length;
      const leaveDays = updatedRecords.filter((r) => r.status === 'ON_LEAVE').length;
      const absentDays = updatedRecords.filter((r) => r.status === 'ABSENT').length;
      const attendanceRate = totalDays > 0 ? Math.round(((presentDays + leaveDays) / totalDays) * 1000) / 10 : 100;

      return {
        ...prev,
        stats: {
          ...prev.stats,
          totalDays,
          presentDays,
          leaveDays,
          absentDays,
          attendanceRate,
        },
        today: {
          status,
          session,
          markedAt: nowStr,
          markedBy: currentUser?.name || 'Warden',
          date: todayDate,
          verified: true,
        },
        records: updatedRecords,
      };
    });
  };

  const saveBatchRollCall = (rollCallMap, date, session = 'NIGHT_ROLL_CALL') => {
    const todayDate = date || new Date().toISOString().split('T')[0];
    const wardenName = currentUser?.name || 'Dr. Vijay K. Singh';

    // Update student STU001 (Aarav Sharma) if present in the rollCallMap
    if (rollCallMap['STU001']) {
      const aaravEntry = rollCallMap['STU001'];
      markRollCall('STU001', aaravEntry.status, session, aaravEntry.remarks);
    }

    const presentCount = Object.values(rollCallMap).filter((v) => v.status === 'PRESENT').length;
    const leaveCount = Object.values(rollCallMap).filter((v) => v.status === 'ON_LEAVE').length;
    const absentCount = Object.values(rollCallMap).filter((v) => v.status === 'ABSENT').length;

    // Log real-time audit Activity
    const newActivity = {
      id: `act-${Date.now()}`,
      title: 'Night Roll-Call Completed',
      description: `${presentCount} Present, ${leaveCount} On Leave, ${absentCount} Absent. Verified by ${wardenName}.`,
      timestamp: 'Just now',
      badgeType: absentCount > 0 ? 'warning' : 'success',
      status: 'VERIFIED',
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Create confirmation Notification
    const newNotifs = [
      {
        id: `notif-${Date.now()}-1`,
        userId: currentUser?.id,
        role: 'warden',
        title: 'Roll-Call Finalized',
        message: `Roll-call for ${todayDate} (${session}) submitted: ${presentCount} Present, ${absentCount} Absent.`,
        time: 'Just now',
        read: false,
      },
    ];

    if (absentCount > 0) {
      newNotifs.push({
        id: `notif-${Date.now()}-2`,
        role: 'parent',
        title: 'Hostel Roll-Call Alert',
        message: `${absentCount} student(s) marked absent during tonight's roll-call. Inspection advised.`,
        time: 'Just now',
        read: false,
      });
    }

    setNotifications((prev) => [...newNotifs, ...prev]);

    return { success: true, presentCount, leaveCount, absentCount };
  };

  const value = {
    isLoading,
    currentUser,
    login,
    switchDemoRole,
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
    // Workflows
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
    // Student & Room management
    updateStudentProfile,
    addStudent,
    deleteStudent,
    allocateRoom,
    // Guard management
    toggleGuardDuty,
    addGuard,
    // Notifications
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetDemoData,
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
