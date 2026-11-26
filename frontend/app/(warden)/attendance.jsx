import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import { LEAVE_STATUS, HOSTEL_STATUS } from '../../constants/config';
import AppHeader from '../../components/common/AppHeader';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import FilterChips from '../../components/common/FilterChips';
import SuccessModal from '../../components/modals/SuccessModal';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Plane,
  Clock,
  Search,
  CheckCheck,
  RotateCcw,
  ShieldCheck,
  Building,
  ChevronLeft,
  ChevronRight,
  Send,
  History,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
} from 'lucide-react-native';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function WardenAttendanceScreen() {
  const router = useRouter();
  const { students, leaveRequests, saveBatchRollCall, getDayAttendance, getMonthlyAttendance } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);

  // Mode: 'daily' (Daily Roll-Call Sheet) | 'monthly' (Month-wise Records & History)
  const [viewMode, setViewMode] = useState('daily');

  // Daily State
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSession, setSelectedSession] = useState('NIGHT_ROLL_CALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSavedInDb, setIsSavedInDb] = useState(false);
  const [lastSavedMeta, setLastSavedMeta] = useState(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionStats, setSubmissionStats] = useState({ present: 0, leave: 0, absent: 0 });

  // Monthly State
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [monthlyData, setMonthlyData] = useState({
    totalStudents: 0,
    totalDaysRecorded: 0,
    averageRate: 100,
    totalPresent: 0,
    totalOnLeave: 0,
    totalAbsent: 0,
    days: [],
  });
  const [loadingMonth, setLoadingMonth] = useState(false);

  // Map of studentId -> { status: 'PRESENT' | 'ON_LEAVE' | 'ABSENT', remarks: string }
  const [rollCall, setRollCall] = useState({});

  // Helper: build fresh roll call for a date
  const buildFreshRollCall = useCallback(() => {
    const initial = {};
    (students || []).forEach((s) => {
      // Check if student has an active approved leave on the selected date
      const activeLeave = (leaveRequests || []).find((l) => {
        if (l.studentId !== s.id) return false;
        const validStatus =
          l.status === LEAVE_STATUS.CHECKED_OUT ||
          l.status === LEAVE_STATUS.WARDEN_APPROVED ||
          l.status === LEAVE_STATUS.EXTENSION_PENDING;

        if (!validStatus) return false;
        // Check date overlap if available
        if (l.departureDate && l.expectedReturnDate) {
          return selectedDate >= l.departureDate && selectedDate <= l.expectedReturnDate;
        }
        return true;
      });

      if (activeLeave || s.hostelStatus === HOSTEL_STATUS.OUTSIDE) {
        initial[s.id] = {
          status: 'ON_LEAVE',
          remarks: activeLeave ? `Approved Pass (${activeLeave.leaveType || 'Leave'})` : 'Outside hostel',
        };
      } else {
        initial[s.id] = {
          status: 'PRESENT',
          remarks: 'Present in room',
        };
      }
    });
    return initial;
  }, [students, leaveRequests, selectedDate]);

  // Load day attendance from MongoDB
  const fetchDayData = useCallback(async (date) => {
    setLoadingDay(true);
    try {
      const res = await getDayAttendance(date);
      if (res && res.isSaved && res.records?.length > 0) {
        // Attendance was already saved for this date in MongoDB
        setIsSavedInDb(true);
        setLastSavedMeta({
          date: res.date,
          markedAt: res.records[0]?.markedAt || 'Today',
          markedBy: res.records[0]?.markedBy || 'Warden',
          count: res.records.length,
        });

        // Map database records into rollCall state
        const savedMap = {};
        res.records.forEach((rec) => {
          savedMap[rec.studentId] = {
            status: rec.status,
            remarks: rec.remarks || '',
          };
        });

        // Ensure any new student registered after saving still appears
        (students || []).forEach((s) => {
          if (!savedMap[s.id]) {
            savedMap[s.id] = { status: 'PRESENT', remarks: 'Present in room' };
          }
        });

        setRollCall(savedMap);
      } else {
        // Not saved yet: Fresh roll call for this day!
        setIsSavedInDb(false);
        setLastSavedMeta(null);
        setRollCall(buildFreshRollCall());
      }
    } catch (e) {
      console.warn('Error fetching day attendance:', e);
      setIsSavedInDb(false);
      setRollCall(buildFreshRollCall());
    } finally {
      setLoadingDay(false);
    }
  }, [getDayAttendance, students, buildFreshRollCall]);

  // Load monthly attendance from MongoDB
  const fetchMonthData = useCallback(async (month) => {
    setLoadingMonth(true);
    try {
      const res = await getMonthlyAttendance(month);
      if (res) {
        setMonthlyData({
          totalStudents: res.totalStudents || students.length,
          totalDaysRecorded: res.totalDaysRecorded || 0,
          averageRate: res.averageRate || 100,
          totalPresent: res.totalPresent || 0,
          totalOnLeave: res.totalOnLeave || 0,
          totalAbsent: res.totalAbsent || 0,
          days: res.days || [],
        });
      }
    } catch (e) {
      console.warn('Error fetching monthly attendance:', e);
    } finally {
      setLoadingMonth(false);
    }
  }, [getMonthlyAttendance, students.length]);

  // Initial load and on selected date change
  useEffect(() => {
    if (viewMode === 'daily') {
      fetchDayData(selectedDate);
    } else {
      fetchMonthData(selectedMonth);
    }
  }, [selectedDate, selectedMonth, viewMode, fetchDayData, fetchMonthData]);

  // Live Stats for the active sheet
  const stats = useMemo(() => {
    const values = Object.values(rollCall);
    const total = students.length;
    const present = values.filter((v) => v.status === 'PRESENT').length;
    const leave = values.filter((v) => v.status === 'ON_LEAVE').length;
    const absent = values.filter((v) => v.status === 'ABSENT').length;
    const rate = total > 0 ? Math.round(((present + leave) / total) * 100) : 100;
    return { total, present, leave, absent, rate };
  }, [rollCall, students]);

  // Change individual student status
  const setStudentStatus = (studentId, status) => {
    setRollCall((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Mark all in-hostel students present
  const handleMarkAllPresent = () => {
    setRollCall((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (next[s.id]?.status !== 'ON_LEAVE') {
          next[s.id] = {
            ...next[s.id],
            status: 'PRESENT',
          };
        }
      });
      return next;
    });
  };

  // Reset to fresh default
  const handleReset = () => {
    setRollCall(buildFreshRollCall());
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return (students || []).filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.roomNo?.toLowerCase().includes(q) ||
        s.enrollmentNo?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const curStatus = rollCall[s.id]?.status;
      if (activeFilter === 'block_a') return s.block?.toLowerCase().includes('a') || s.roomNo?.startsWith('A');
      if (activeFilter === 'block_b') return s.block?.toLowerCase().includes('b') || s.roomNo?.startsWith('B');
      if (activeFilter === 'present') return curStatus === 'PRESENT';
      if (activeFilter === 'on_leave') return curStatus === 'ON_LEAVE';
      if (activeFilter === 'absent') return curStatus === 'ABSENT';

      return true;
    });
  }, [students, rollCall, searchQuery, activeFilter]);

  // Save Today's or Day's Attendance to MongoDB
  const handleSubmit = async () => {
    setSavingBatch(true);
    try {
      const res = await saveBatchRollCall(rollCall, selectedDate, selectedSession);
      setSubmissionStats({
        present: res.presentCount,
        leave: res.leaveCount,
        absent: res.absentCount,
      });
      setIsSavedInDb(true);
      setLastSavedMeta({
        date: selectedDate,
        markedAt: 'Just now',
        markedBy: 'Warden',
        count: Object.keys(rollCall).length,
      });
      setShowSuccessModal(true);
    } catch (e) {
      console.error('Failed to submit roll-call:', e);
    } finally {
      setSavingBatch(false);
    }
  };

  // Date Navigation Helpers
  const shiftDay = (days) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    const newStr = current.toISOString().split('T')[0];
    setSelectedDate(newStr);
  };

  const shiftMonth = (months) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + months, 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yr}-${mo}`);
  };

  const formatMonthTitle = (monthStr) => {
    const [y, m] = monthStr.split('-').map(Number);
    return `${MONTH_NAMES[m - 1]} ${y}`;
  };

  const formatDateDisplay = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const formatted = d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    if (dateStr === todayStr) return `Today • ${formatted}`;
    return formatted;
  };

  const isTodaySelected = selectedDate === todayStr;

  const filterOptions = [
    { id: 'all', label: 'All Students' },
    { id: 'block_a', label: 'Block A' },
    { id: 'block_b', label: 'Block B' },
    { id: 'present', label: `Present (${stats.present})` },
    { id: 'on_leave', label: `On Leave (${stats.leave})` },
    { id: 'absent', label: `Absent (${stats.absent})` },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Hostel Attendance"
        subtitle="Month-wise Records & Daily Roll-Call"
        showBack={true}
        onBackPress={() => router.back()}
        showLogout={false}
      />

      {/* Main Mode Toggle: Daily Roll-Call vs Month-wise Records */}
      <View style={styles.modeTabsWrapper}>
        <View style={styles.modeTabsContainer}>
          <TouchableOpacity
            style={[styles.modeTab, viewMode === 'daily' && styles.modeTabActive]}
            onPress={() => setViewMode('daily')}
            activeOpacity={0.8}
          >
            <Calendar size={14} color={viewMode === 'daily' ? COLORS.primary : COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.modeTabText, viewMode === 'daily' && styles.modeTabTextActive]}>
              Daily Roll-Call
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, viewMode === 'monthly' && styles.modeTabActive]}
            onPress={() => setViewMode('monthly')}
            activeOpacity={0.8}
          >
            <History size={14} color={viewMode === 'monthly' ? COLORS.primary : COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.modeTabText, viewMode === 'monthly' && styles.modeTabTextActive]}>
              Month-wise Records
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* VIEW MODE 1: DAILY ROLL-CALL */}
      {viewMode === 'daily' ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Navigator Bar */}
          <View style={styles.dateNavCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.98)', 'rgba(240, 246, 255, 0.9)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dateNavInner}
            >
              <View style={styles.dateNavHeader}>
                <TouchableOpacity
                  style={styles.navChevronBtn}
                  onPress={() => shiftDay(-1)}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={18} color={COLORS.primaryDark} />
                </TouchableOpacity>

                <View style={styles.dateHeaderCenter}>
                  <Text style={styles.dateNavSub}>SELECTED DATE</Text>
                  <Text style={styles.dateNavMain}>{formatDateDisplay(selectedDate)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.navChevronBtn}
                  onPress={() => shiftDay(1)}
                  activeOpacity={0.7}
                >
                  <ChevronRight size={18} color={COLORS.primaryDark} />
                </TouchableOpacity>
              </View>

              {/* Quick Jump Buttons */}
              <View style={styles.quickDateRow}>
                <TouchableOpacity
                  style={[styles.quickDateChip, !isTodaySelected && styles.quickDateChipActive]}
                  onPress={() => setSelectedDate(todayStr)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickDateText, !isTodaySelected && styles.quickDateTextActive]}>
                    Go to Today
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickDateChip}
                  onPress={() => shiftDay(1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickDateText}>Next Day (Tomorrow)</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Database State Banner (Saved vs Fresh) */}
          <View style={styles.stateBannerContainer}>
            {loadingDay ? (
              <View style={styles.loadingBanner}>
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.loadingBannerText}>Checking database for {selectedDate}...</Text>
              </View>
            ) : isSavedInDb ? (
              <View style={styles.savedBanner}>
                <View style={styles.savedIconCircle}>
                  <CheckCircle2 size={16} color="#15803D" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.savedBannerTitle}>Saved in MongoDB Database</Text>
                  <Text style={styles.savedBannerSub}>
                    Verified on {lastSavedMeta?.date || selectedDate} • {lastSavedMeta?.count || stats.total} students recorded. You can update and re-save anytime.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.freshBanner}>
                <View style={styles.freshIconCircle}>
                  <Sparkles size={16} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.freshBannerTitle}>
                    {isTodaySelected ? "Today's Fresh Roll-Call Sheet" : `Fresh Attendance Sheet for ${selectedDate}`}
                  </Text>
                  <Text style={styles.freshBannerSub}>
                    Not saved yet. Students with approved leave are automatically set to 'On Leave'. Verify and save to MongoDB.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Session Selector */}
          <View style={styles.sessionSelectorContainer}>
            <View style={styles.sessionTabsRow}>
              {[
                { id: 'NIGHT_ROLL_CALL', label: '🌙 Night (08:30 PM)' },
                { id: 'MORNING', label: '☀️ Morning (07:00 AM)' },
                { id: 'DINNER', label: '🍽️ Dinner (09:30 PM)' },
              ].map((sess) => {
                const isSelected = selectedSession === sess.id;
                return (
                  <TouchableOpacity
                    key={sess.id}
                    onPress={() => setSelectedSession(sess.id)}
                    style={[styles.sessionTab, isSelected && styles.sessionTabActive]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.sessionTabText, isSelected && styles.sessionTabTextActive]}>
                      {sess.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Live Attendance Stats Trio */}
          <View style={styles.statsRow}>
            <View style={[styles.statPod, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
              <View style={styles.statPodHeader}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.statPodLabel}>Present</Text>
              </View>
              <Text style={[styles.statPodValue, { color: COLORS.success }]}>{stats.present}</Text>
            </View>

            <View style={[styles.statPod, { borderColor: 'rgba(37, 99, 235, 0.3)' }]}>
              <View style={styles.statPodHeader}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.statPodLabel}>On Leave</Text>
              </View>
              <Text style={[styles.statPodValue, { color: COLORS.primary }]}>{stats.leave}</Text>
            </View>

            <View style={[styles.statPod, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
              <View style={styles.statPodHeader}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.danger }]} />
                <Text style={styles.statPodLabel}>Absent</Text>
              </View>
              <Text style={[styles.statPodValue, { color: COLORS.danger }]}>{stats.absent}</Text>
            </View>

            <View style={[styles.statPod, { borderColor: 'rgba(100, 116, 139, 0.2)' }]}>
              <View style={styles.statPodHeader}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.textMuted }]} />
                <Text style={styles.statPodLabel}>Total</Text>
              </View>
              <Text style={[styles.statPodValue, { color: COLORS.textPrimary }]}>{stats.total}</Text>
            </View>
          </View>

          {/* Quick Actions (Mark All In-Hostel Present / Reset) */}
          <View style={styles.batchActionsRow}>
            <TouchableOpacity
              style={styles.batchBtn}
              onPress={handleMarkAllPresent}
              activeOpacity={0.8}
            >
              <CheckCheck size={14} color={COLORS.primaryDark} style={{ marginRight: 6 }} />
              <Text style={styles.batchBtnText}>Mark In-Hostel Present</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
              <RotateCcw size={13} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.resetBtnText}>Reset Fresh</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search student name, room (A-204)..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Chips */}
          <FilterChips
            filters={filterOptions}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
          />

          {/* Student Roll-Call List */}
          <View style={styles.studentsList}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const entry = rollCall[student.id] || { status: 'PRESENT', remarks: '' };
                const isPresent = entry.status === 'PRESENT';
                const isOnLeave = entry.status === 'ON_LEAVE';
                const isAbsent = entry.status === 'ABSENT';

                const activeLeave = (leaveRequests || []).find((l) => {
                  if (l.studentId !== student.id) return false;
                  return (
                    l.status === LEAVE_STATUS.CHECKED_OUT ||
                    l.status === LEAVE_STATUS.WARDEN_APPROVED ||
                    l.status === LEAVE_STATUS.EXTENSION_PENDING
                  );
                });

                return (
                  <View key={student.id} style={styles.studentCard}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.9)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.studentCardInner}
                    >
                      <View style={styles.cardGloss} />

                      <View style={styles.studentInfoRow}>
                        <ProfileAvatar
                          uri={student.avatar}
                          name={student.name}
                          size={44}
                          status={isPresent ? 'present' : 'outside'}
                        />

                        <View style={styles.studentMeta}>
                          <View style={styles.nameBadgeRow}>
                            <Text style={styles.studentName} numberOfLines={1}>
                              {student.name}
                            </Text>
                            <View style={styles.roomTag}>
                              <Building size={11} color={COLORS.primary} style={{ marginRight: 3 }} />
                              <Text style={styles.roomTagText}>{student.roomNo || 'Unassigned'}</Text>
                            </View>
                          </View>
                          <Text style={styles.enrollmentText}>
                            {student.enrollmentNo} • {student.department || 'Engineering'}
                          </Text>
                        </View>
                      </View>

                      {/* On Leave Notice Banner */}
                      {activeLeave && (
                        <View style={styles.leaveBanner}>
                          <Plane size={12} color={COLORS.primary} style={{ marginRight: 5 }} />
                          <Text style={styles.leaveBannerText} numberOfLines={1}>
                            Active Pass #{activeLeave.passId || activeLeave.id}: {activeLeave.leaveType} ({activeLeave.reason})
                          </Text>
                        </View>
                      )}

                      {/* 3-Way Roll-Call Toggle */}
                      <View style={styles.toggleRow}>
                        <TouchableOpacity
                          onPress={() => setStudentStatus(student.id, 'PRESENT')}
                          style={[styles.toggleBtn, isPresent && styles.presentBtnActive]}
                          activeOpacity={0.8}
                        >
                          <CheckCircle2
                            size={14}
                            color={isPresent ? '#FFFFFF' : COLORS.success}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.toggleBtnText,
                              isPresent && styles.toggleBtnTextActive,
                              !isPresent && { color: COLORS.successDark },
                            ]}
                          >
                            Present
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setStudentStatus(student.id, 'ON_LEAVE')}
                          style={[styles.toggleBtn, isOnLeave && styles.leaveBtnActive]}
                          activeOpacity={0.8}
                        >
                          <Plane
                            size={13}
                            color={isOnLeave ? '#FFFFFF' : COLORS.primary}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.toggleBtnText,
                              isOnLeave && styles.toggleBtnTextActive,
                              !isOnLeave && { color: COLORS.primaryDark },
                            ]}
                          >
                            On Leave
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setStudentStatus(student.id, 'ABSENT')}
                          style={[styles.toggleBtn, isAbsent && styles.absentBtnActive]}
                          activeOpacity={0.8}
                        >
                          <XCircle
                            size={14}
                            color={isAbsent ? '#FFFFFF' : COLORS.danger}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.toggleBtnText,
                              isAbsent && styles.toggleBtnTextActive,
                              !isAbsent && { color: COLORS.dangerDark },
                            ]}
                          >
                            Absent
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>
                );
              })
            ) : (
              <EmptyState
                title="No Students Found"
                description={students.length === 0 ? "No registered students in the hostel database." : "No students matching your search/filter."}
              />
            )}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      ) : (
        /* VIEW MODE 2: MONTH-WISE ATTENDANCE RECORDS */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Month Selector Bar */}
          <View style={styles.monthSelectorCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.98)', 'rgba(240, 246, 255, 0.92)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.monthSelectorInner}
            >
              <View style={styles.monthNavRow}>
                <TouchableOpacity
                  style={styles.navChevronBtn}
                  onPress={() => shiftMonth(-1)}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={20} color={COLORS.primaryDark} />
                </TouchableOpacity>

                <View style={styles.monthTitleGroup}>
                  <Text style={styles.monthNavSub}>MONTHLY RECORD ARCHIVE</Text>
                  <Text style={styles.monthNavMain}>{formatMonthTitle(selectedMonth)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.navChevronBtn}
                  onPress={() => shiftMonth(1)}
                  activeOpacity={0.7}
                >
                  <ChevronRight size={20} color={COLORS.primaryDark} />
                </TouchableOpacity>
              </View>

              {/* Jump to Current Month */}
              {selectedMonth !== currentMonthStr && (
                <TouchableOpacity
                  style={styles.jumpCurrentMonthBtn}
                  onPress={() => setSelectedMonth(currentMonthStr)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.jumpCurrentMonthText}>Jump to Current Month ({formatMonthTitle(currentMonthStr)})</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>

          {/* Monthly Summary Statistics Grid */}
          <View style={styles.monthlySummaryGrid}>
            <View style={styles.monthlyStatCard}>
              <View style={styles.statIconBadge}>
                <Calendar size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.monthlyStatNumber}>{monthlyData.totalDaysRecorded}</Text>
              <Text style={styles.monthlyStatLabel}>Days Recorded</Text>
            </View>

            <View style={styles.monthlyStatCard}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <TrendingUp size={16} color={COLORS.success} />
              </View>
              <Text style={[styles.monthlyStatNumber, { color: COLORS.success }]}>{monthlyData.averageRate}%</Text>
              <Text style={styles.monthlyStatLabel}>Avg Compliance</Text>
            </View>

            <View style={styles.monthlyStatCard}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                <Users size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.monthlyStatNumber}>{monthlyData.totalPresent}</Text>
              <Text style={styles.monthlyStatLabel}>Present Check-ins</Text>
            </View>

            <View style={styles.monthlyStatCard}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <XCircle size={16} color={COLORS.danger} />
              </View>
              <Text style={[styles.monthlyStatNumber, { color: COLORS.danger }]}>{monthlyData.totalAbsent}</Text>
              <Text style={styles.monthlyStatLabel}>Total Absences</Text>
            </View>
          </View>

          {/* Recorded Days List */}
          <View style={styles.daysListSection}>
            <Text style={styles.daysListHeaderTitle}>
              RECORDED SESSIONS IN {formatMonthTitle(selectedMonth).toUpperCase()}
            </Text>

            {loadingMonth ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingBannerText}>Loading monthly records...</Text>
              </View>
            ) : monthlyData.days.length > 0 ? (
              monthlyData.days.map((day) => (
                <View key={day.date} style={styles.dayRecordCard}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.92)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dayRecordInner}
                  >
                    <View style={styles.cardGloss} />

                    <View style={styles.dayTopRow}>
                      <View>
                        <Text style={styles.dayDateTitle}>{formatDateDisplay(day.date)}</Text>
                        <Text style={styles.daySubText}>
                          {day.totalMarked} students verified
                        </Text>
                      </View>

                      <View style={styles.dayRateBadge}>
                        <ShieldCheck size={12} color={COLORS.success} style={{ marginRight: 4 }} />
                        <Text style={styles.dayRateText}>{day.rate}% Verified</Text>
                      </View>
                    </View>

                    {/* Day Counts Pods */}
                    <View style={styles.dayCountsRow}>
                      <View style={styles.miniCountPill}>
                        <View style={[styles.miniDot, { backgroundColor: COLORS.success }]} />
                        <Text style={styles.miniCountText}>{day.present} Present</Text>
                      </View>

                      <View style={styles.miniCountPill}>
                        <View style={[styles.miniDot, { backgroundColor: COLORS.primary }]} />
                        <Text style={styles.miniCountText}>{day.onLeave} On Leave</Text>
                      </View>

                      <View style={styles.miniCountPill}>
                        <View style={[styles.miniDot, { backgroundColor: COLORS.danger }]} />
                        <Text style={styles.miniCountText}>{day.absent} Absent</Text>
                      </View>
                    </View>

                    {/* Action to view / edit this day */}
                    <TouchableOpacity
                      style={styles.viewDayBtn}
                      onPress={() => {
                        setSelectedDate(day.date);
                        setViewMode('daily');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewDayBtnText}>Open & Edit Day's Roll-Call</Text>
                      <ArrowRight size={14} color={COLORS.primary} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              ))
            ) : (
              <EmptyState
                title="No Attendance for this Month"
                description={`There are no saved roll-call records for ${formatMonthTitle(selectedMonth)} in MongoDB.`}
              />
            )}
          </View>
        </ScrollView>
      )}

      {/* Floating Bottom Bar (Only visible in Daily mode) */}
      {viewMode === 'daily' && (
        <View style={styles.bottomBar}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.98)', 'rgba(240, 246, 255, 0.94)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bottomBarInner}
          >
            <View style={styles.cardGloss} />

            <View style={styles.bottomSummary}>
              <Text style={styles.summaryTitle}>
                {isSavedInDb ? 'Database Record' : isTodaySelected ? "Today's Attendance" : 'Roll-Call Sheet'}
              </Text>
              <Text style={styles.summaryNumbers}>
                {stats.present} Present • {stats.leave} Leave • {stats.absent} Absent
              </Text>
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={savingBatch}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={COLORS.gradients.liquidBlue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {savingBatch ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Send size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.submitText}>
                      {isSavedInDb ? 'Update Roll-Call' : isTodaySelected ? "Save Today's Attendance" : 'Save Attendance'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Roll-Call Saved!"
        message={`Attendance for ${selectedDate} has been saved to MongoDB (${submissionStats.present} Present, ${submissionStats.leave} On Leave, ${submissionStats.absent} Absent).`}
        buttonText="Done"
        onClose={() => {
          setShowSuccessModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  cardGloss: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modeTabsWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  modeTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(226, 232, 240, 0.7)',
    borderRadius: 14,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeTabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  dateNavCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  dateNavInner: {
    borderRadius: 18,
    padding: 14,
  },
  dateNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navChevronBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dateHeaderCenter: {
    alignItems: 'center',
  },
  dateNavSub: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  dateNavMain: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  quickDateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },
  quickDateChip: {
    backgroundColor: 'rgba(241, 245, 249, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.6)',
  },
  quickDateChipActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderColor: COLORS.primary,
  },
  quickDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  quickDateTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  stateBannerContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderRadius: 14,
  },
  loadingBannerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 253, 244, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 14,
    padding: 12,
  },
  savedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  savedBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  savedBannerSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
    lineHeight: 15,
  },
  freshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(238, 242, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 14,
    padding: 12,
  },
  freshIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  freshBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  freshBannerSub: {
    fontSize: 11,
    color: '#4338CA',
    marginTop: 2,
    lineHeight: 15,
  },
  sessionSelectorContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sessionTabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    borderRadius: 14,
    padding: 4,
  },
  sessionTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
  },
  sessionTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sessionTabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  statPod: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statPodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statPodLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statPodValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  batchActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  batchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  batchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.6)',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.7)',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    padding: 0,
  },
  studentsList: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  studentCard: {
    marginBottom: 10,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  studentCardInner: {
    borderRadius: 18,
    padding: 14,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentMeta: {
    flex: 1,
    marginLeft: 10,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roomTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  enrollmentText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  leaveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  leaveBannerText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '700',
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  presentBtnActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  leaveBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  absentBtnActive: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  // Monthly Styles
  monthSelectorCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  monthSelectorInner: {
    borderRadius: 18,
    padding: 14,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitleGroup: {
    alignItems: 'center',
  },
  monthNavSub: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  monthNavMain: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  jumpCurrentMonthBtn: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  jumpCurrentMonthText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  monthlySummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginBottom: 14,
  },
  monthlyStatCard: {
    width: '47%',
    margin: '1.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthlyStatNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  monthlyStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  daysListSection: {
    paddingHorizontal: 16,
  },
  daysListHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  dayRecordCard: {
    marginBottom: 10,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dayRecordInner: {
    borderRadius: 18,
    padding: 14,
  },
  dayTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayDateTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  daySubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  dayRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  dayRateText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.successDark,
  },
  dayCountsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  miniCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  miniCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  viewDayBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  viewDayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  centerLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 8,
  },
  bottomBarInner: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomSummary: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  summaryNumbers: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  submitText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
