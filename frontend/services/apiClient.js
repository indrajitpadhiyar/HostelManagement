import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In development:
// - Android Emulator uses 10.0.2.2:5000
// - iOS Simulator / Web uses localhost:5000
// - Physical device uses your machine's LAN IP (e.g., 192.168.x.x)
const DEV_HOST = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1',
});

export const API_BASE_URL = DEV_HOST;
const TOKEN_KEY = '@hosteleasy_jwt_token_v1';

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Failed to store JWT token:', e);
    }
  }

  async clearToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Failed to clear JWT token:', e);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'API request failed');
        error.statusCode = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.warn(`[ApiClient Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
      throw error;
    }
  }

  // --- Auth APIs ---
  async register(payload) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: payload,
    });
    if (res?.data?.token) {
      await this.setToken(res.data.token);
    }
    return res.data;
  }

  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (res?.data?.token) {
      await this.setToken(res.data.token);
    }
    return res.data;
  }

  async getMe() {
    const res = await this.request('/auth/me');
    return res.data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      await this.clearToken();
    }
  }

  // --- Leaves APIs ---
  async getLeaves(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/leaves?${query}` : '/leaves';
    const res = await this.request(endpoint);
    return res.data;
  }

  async applyLeave(leavePayload) {
    const res = await this.request('/leaves', {
      method: 'POST',
      body: leavePayload,
    });
    return res.data;
  }

  async parentDecision(leaveId, approved, remarks) {
    const res = await this.request(`/leaves/${leaveId}/parent-decision`, {
      method: 'PATCH',
      body: { approved, remarks },
    });
    return res.data;
  }

  async wardenDecision(leaveId, approved, remarks) {
    const res = await this.request(`/leaves/${leaveId}/warden-decision`, {
      method: 'PATCH',
      body: { approved, remarks },
    });
    return res.data;
  }

  async requestExtension(leaveId, extendedReturnDate, reason) {
    const res = await this.request(`/leaves/${leaveId}/extend`, {
      method: 'POST',
      body: { extendedReturnDate, reason },
    });
    return res.data;
  }

  // --- Guard Gate Scan APIs ---
  async scanVerify(qrOrPassId) {
    const res = await this.request('/guard/scan-verify', {
      method: 'POST',
      body: { qrCode: qrOrPassId },
    });
    return res.data;
  }

  async recordGateExit(leaveRequestId, remarks, gateNumber) {
    const res = await this.request('/guard/record-exit', {
      method: 'POST',
      body: { leaveRequestId, remarks, gateNumber },
    });
    return res.data;
  }

  async recordGateReturn(leaveRequestId, remarks, gateNumber) {
    const res = await this.request('/guard/record-return', {
      method: 'POST',
      body: { leaveRequestId, remarks, gateNumber },
    });
    return res.data;
  }

  // --- Warden Management & Analytics APIs ---
  async getWardenDashboard() {
    const res = await this.request('/warden/dashboard');
    return res.data;
  }

  async getReports(period = 'month') {
    const res = await this.request(`/warden/reports?period=${period}`);
    return res.data;
  }

  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/students${query ? `?${query}` : ''}`);
    return res.data;
  }

  async getRooms(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/rooms${query ? `?${query}` : ''}`);
    return res.data;
  }

  async createStudent(payload) {
    const res = await this.request('/students', {
      method: 'POST',
      body: payload,
    });
    return res.data;
  }

  async deleteStudent(studentId) {
    const res = await this.request(`/students/${studentId}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  async reallocateRoom(studentId, newRoomNo) {
    const res = await this.request(`/students/${studentId}/reallocate`, {
      method: 'POST',
      body: { newRoomNo },
    });
    return res.data;
  }

  async approveStudent(studentId) {
    const res = await this.request(`/students/${studentId}/approve`, {
      method: 'POST',
    });
    return res.data;
  }

  async rejectStudent(studentId, reason = '') {
    const res = await this.request(`/students/${studentId}/reject`, {
      method: 'POST',
      body: { reason },
    });
    return res.data;
  }

  async createRoom(payload) {
    const res = await this.request('/rooms', {
      method: 'POST',
      body: payload,
    });
    return res.data;
  }

  async getGuardDashboard() {
    const res = await this.request('/guard/dashboard');
    return res.data;
  }

  async getGuardHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/guard/gate-history${query ? `?${query}` : ''}`);
    return res.data;
  }

  async getNotifications() {
    const res = await this.request('/notifications');
    return res.data;
  }

  async markAllNotificationsRead() {
    const res = await this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
    return res.data;
  }

  // --- Attendance APIs ---
  async getStudentAttendance(studentId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = studentId
      ? `/attendance/student/${studentId}${query ? `?${query}` : ''}`
      : `/attendance/student${query ? `?${query}` : ''}`;
    const res = await this.request(endpoint);
    return res.data;
  }

  async getAttendanceOverview() {
    const res = await this.request('/attendance/overview');
    return res.data;
  }

  async getMonthlyAttendance(month) {
    const query = month ? `?month=${month}` : '';
    const res = await this.request(`/attendance/monthly${query}`);
    return res.data;
  }

  async getDayAttendance(date) {
    const query = date ? `?date=${date}` : '';
    const res = await this.request(`/attendance/day${query}`);
    return res.data;
  }

  async markAttendance(payload) {
    const res = await this.request('/attendance/mark', {
      method: 'POST',
      body: payload,
    });
    return res.data;
  }

  async saveBatchAttendance(payload) {
    const res = await this.request('/attendance/batch', {
      method: 'POST',
      body: payload,
    });
    return res.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
