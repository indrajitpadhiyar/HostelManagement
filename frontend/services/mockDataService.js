import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_STUDENTS } from '../data/students';
import { INITIAL_PARENTS } from '../data/parents';
import { INITIAL_WARDENS } from '../data/wardens';
import { INITIAL_GUARDS } from '../data/guards';
import { INITIAL_ROOMS } from '../data/rooms';
import { INITIAL_LEAVE_REQUESTS } from '../data/leaveRequests';
import { INITIAL_ACTIVITIES } from '../data/activities';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';
import { INITIAL_ATTENDANCE } from '../data/attendance';

const STORAGE_KEYS = {
  USER_SESSION: '@hosteleasy_session_v1',
  STUDENTS: '@hosteleasy_students_v1',
  ROOMS: '@hosteleasy_rooms_v1',
  LEAVES: '@hosteleasy_leaves_v1',
  ACTIVITIES: '@hosteleasy_activities_v1',
  NOTIFICATIONS: '@hosteleasy_notifications_v1',
  GUARDS: '@hosteleasy_guards_v1',
  ATTENDANCE: '@hosteleasy_attendance_v1',
};

export const MockDataService = {
  async getStoredSession() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveSession(user) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save session:', e);
    }
  },

  async clearSession() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
  },

  async loadInitialData() {
    try {
      const [storedStudents, storedRooms, storedLeaves, storedActivities, storedNotifs, storedGuards, storedAttendance] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.STUDENTS),
          AsyncStorage.getItem(STORAGE_KEYS.ROOMS),
          AsyncStorage.getItem(STORAGE_KEYS.LEAVES),
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.GUARDS),
          AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE),
        ]);

      return {
        students: storedStudents ? JSON.parse(storedStudents) : INITIAL_STUDENTS,
        rooms: storedRooms ? JSON.parse(storedRooms) : INITIAL_ROOMS,
        leaveRequests: storedLeaves ? JSON.parse(storedLeaves) : INITIAL_LEAVE_REQUESTS,
        activities: storedActivities ? JSON.parse(storedActivities) : INITIAL_ACTIVITIES,
        notifications: storedNotifs ? JSON.parse(storedNotifs) : INITIAL_NOTIFICATIONS,
        guards: storedGuards ? JSON.parse(storedGuards) : INITIAL_GUARDS,
        attendance: storedAttendance ? JSON.parse(storedAttendance) : INITIAL_ATTENDANCE,
        parents: INITIAL_PARENTS,
        wardens: INITIAL_WARDENS,
      };
    } catch {
      return {
        students: INITIAL_STUDENTS,
        rooms: INITIAL_ROOMS,
        leaveRequests: INITIAL_LEAVE_REQUESTS,
        activities: INITIAL_ACTIVITIES,
        notifications: INITIAL_NOTIFICATIONS,
        guards: INITIAL_GUARDS,
        attendance: INITIAL_ATTENDANCE,
        parents: INITIAL_PARENTS,
        wardens: INITIAL_WARDENS,
      };
    }
  },

  async persistData({ students, rooms, leaveRequests, activities, notifications, guards, attendance }) {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students)),
        AsyncStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms)),
        AsyncStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaveRequests)),
        AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities)),
        AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)),
        guards ? AsyncStorage.setItem(STORAGE_KEYS.GUARDS, JSON.stringify(guards)) : Promise.resolve(),
        attendance ? AsyncStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance)) : Promise.resolve(),
      ]);
    } catch (e) {
      console.warn('Error persisting data to storage:', e);
    }
  },

  async resetToDefaults() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.STUDENTS,
        STORAGE_KEYS.ROOMS,
        STORAGE_KEYS.LEAVES,
        STORAGE_KEYS.ACTIVITIES,
        STORAGE_KEYS.NOTIFICATIONS,
        STORAGE_KEYS.GUARDS,
      ]);
      return {
        students: INITIAL_STUDENTS,
        rooms: INITIAL_ROOMS,
        leaveRequests: INITIAL_LEAVE_REQUESTS,
        activities: INITIAL_ACTIVITIES,
        notifications: INITIAL_NOTIFICATIONS,
        guards: INITIAL_GUARDS,
      };
    } catch {
      return null;
    }
  },
};

export default MockDataService;
