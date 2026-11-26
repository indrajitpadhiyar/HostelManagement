import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_SESSION: '@hosteleasy_session_v3',
  STUDENTS: '@hosteleasy_students_v3',
  ROOMS: '@hosteleasy_rooms_v3',
  LEAVES: '@hosteleasy_leaves_v3',
  ACTIVITIES: '@hosteleasy_activities_v3',
  NOTIFICATIONS: '@hosteleasy_notifications_v3',
  GUARDS: '@hosteleasy_guards_v3',
  ATTENDANCE: '@hosteleasy_attendance_v3',
};

// Legacy keys to purge obsolete dummy/demo data from device storage
const LEGACY_STORAGE_KEYS = [
  '@hosteleasy_session_v1',
  '@hosteleasy_students_v1',
  '@hosteleasy_rooms_v1',
  '@hosteleasy_leaves_v1',
  '@hosteleasy_activities_v1',
  '@hosteleasy_notifications_v1',
  '@hosteleasy_guards_v1',
  '@hosteleasy_attendance_v1',
  '@hosteleasy_session_v2',
  '@hosteleasy_students_v2',
  '@hosteleasy_rooms_v2',
  '@hosteleasy_leaves_v2',
  '@hosteleasy_activities_v2',
  '@hosteleasy_notifications_v2',
  '@hosteleasy_guards_v2',
  '@hosteleasy_attendance_v2',
];

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
      // Purge legacy mock cache
      await AsyncStorage.multiRemove(LEGACY_STORAGE_KEYS).catch(() => {});

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
        students: storedStudents ? JSON.parse(storedStudents) : [],
        rooms: storedRooms ? JSON.parse(storedRooms) : [],
        leaveRequests: storedLeaves ? JSON.parse(storedLeaves) : [],
        activities: storedActivities ? JSON.parse(storedActivities) : [],
        notifications: storedNotifs ? JSON.parse(storedNotifs) : [],
        guards: storedGuards ? JSON.parse(storedGuards) : [],
        attendance: storedAttendance ? JSON.parse(storedAttendance) : { date: '', records: [], stats: { total: 0, present: 0, absent: 0, onLeave: 0 } },
        parents: [],
        wardens: [],
      };
    } catch {
      return {
        students: [],
        rooms: [],
        leaveRequests: [],
        activities: [],
        notifications: [],
        guards: [],
        attendance: { date: '', records: [], stats: { total: 0, present: 0, absent: 0, onLeave: 0 } },
        parents: [],
        wardens: [],
      };
    }
  },

  async persistData(data) {
    try {
      const pairs = [
        [STORAGE_KEYS.STUDENTS, JSON.stringify(data.students || [])],
        [STORAGE_KEYS.ROOMS, JSON.stringify(data.rooms || [])],
        [STORAGE_KEYS.LEAVES, JSON.stringify(data.leaveRequests || [])],
        [STORAGE_KEYS.ACTIVITIES, JSON.stringify(data.activities || [])],
        [STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications || [])],
        [STORAGE_KEYS.GUARDS, JSON.stringify(data.guards || [])],
      ];
      if (data.attendance) {
        pairs.push([STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance)]);
      }
      await AsyncStorage.multiSet(pairs);
    } catch (e) {
      console.warn('Failed to persist cache:', e);
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      await AsyncStorage.multiRemove(LEGACY_STORAGE_KEYS);
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  },
};

export default MockDataService;
