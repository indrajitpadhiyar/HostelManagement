import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
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
import RoleTabBar from '../../components/navigation/RoleTabBar';
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
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react-native';

export default function WardenAttendanceScreen() {
  const router = useRouter();
  const { students, leaveRequests, saveBatchRollCall } = useApp();

  const [selectedSession, setSelectedSession] = useState('NIGHT_ROLL_CALL'); // NIGHT_ROLL_CALL | MORNING | DINNER
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionStats, setSubmissionStats] = useState({ present: 0, leave: 0, absent: 0 });

  // Map of studentId -> { status: 'PRESENT' | 'ON_LEAVE' | 'ABSENT', remarks: string }
  const [rollCall, setRollCall] = useState(() => {
    const initial = {};
    (students || []).forEach((s) => {
      // Check if student has an active approved leave
      const activeLeave = (leaveRequests || []).find(
        (l) =>
          l.studentId === s.id &&
          (l.status === LEAVE_STATUS.CHECKED_OUT ||
            l.status === LEAVE_STATUS.WARDEN_APPROVED ||
            l.status === LEAVE_STATUS.EXTENSION_PENDING)
      );

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
  });

  // Calculate live statistics
  const stats = useMemo(() => {
    const values = Object.values(rollCall);
    const total = students.length;
    const present = values.filter((v) => v.status === 'PRESENT').length;
    const leave = values.filter((v) => v.status === 'ON_LEAVE').length;
    const absent = values.filter((v) => v.status === 'ABSENT').length;
    const rate = total > 0 ? Math.round(((present + leave) / total) * 100) : 100;
    return { total, present, leave, absent, rate };
  }, [rollCall, students]);

  // Handle individual status toggle
  const setStudentStatus = (studentId, status) => {
    setRollCall((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Mark all active students present (except those currently on leave)
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

  // Reset all
  const handleReset = () => {
    setRollCall((prev) => {
      const next = {};
      students.forEach((s) => {
        next[s.id] = { status: 'PRESENT', remarks: '' };
      });
      return next;
    });
  };

  // Filter students list
  const filteredStudents = useMemo(() => {
    return (students || []).filter((s) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.roomNo.toLowerCase().includes(q) ||
        s.enrollmentNo.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Filter
      const curStatus = rollCall[s.id]?.status;
      if (activeFilter === 'block_a') return s.block?.toLowerCase().includes('a') || s.roomNo?.startsWith('A');
      if (activeFilter === 'block_b') return s.block?.toLowerCase().includes('b') || s.roomNo?.startsWith('B');
      if (activeFilter === 'present') return curStatus === 'PRESENT';
      if (activeFilter === 'on_leave') return curStatus === 'ON_LEAVE';
      if (activeFilter === 'absent') return curStatus === 'ABSENT';

      return true;
    });
  }, [students, rollCall, searchQuery, activeFilter]);

  // Submit roll-call
  const handleSubmit = () => {
    const res = saveBatchRollCall(rollCall, selectedDate, selectedSession);
    setSubmissionStats({
      present: res.presentCount,
      leave: res.leaveCount,
      absent: res.absentCount,
    });
    setShowSuccessModal(true);
  };

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
      {/* Ambient background glow */}
      <View pointerEvents="none" style={styles.ambientContainer}>
        <View style={styles.ambientOrb1} />
        <View style={styles.ambientOrb2} />
      </View>

      <AppHeader
        title="Hostel Roll-Call"
        subtitle="Daily Attendance Verification"
        showBack={true}
        onBackPress={() => router.back()}
        showLogout={false}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Session & Date Liquid Glass Selector */}
        <View style={styles.selectorCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(238, 246, 255, 0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.selectorInner}
          >
            <View style={styles.cardGloss} />

            {/* Date Row */}
            <View style={styles.dateRow}>
              <View style={styles.dateLabelGroup}>
                <View style={styles.calendarIconCircle}>
                  <Calendar size={16} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.dateTitle}>Roll-Call Date</Text>
                  <Text style={styles.dateValue}>Today • Tuesday, 24 Nov 2026</Text>
                </View>
              </View>

              <View style={styles.compliancePill}>
                <ShieldCheck size={12} color={COLORS.success} style={{ marginRight: 4 }} />
                <Text style={styles.compliancePillText}>{stats.rate}% Verified</Text>
              </View>
            </View>

            {/* Session Tabs */}
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
                    style={[
                      styles.sessionTab,
                      isSelected && styles.sessionTabActive,
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.sessionTabText,
                        isSelected && styles.sessionTabTextActive,
                      ]}
                    >
                      {sess.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </View>

        {/* Live Attendance Stats Trio */}
        <View style={styles.statsRow}>
          <View style={[styles.statPod, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
            <View style={styles.statPodHeader}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.statPodLabel}>Present</Text>
            </View>
            <Text style={[styles.statPodValue, { color: COLORS.success }]}>
              {stats.present}
            </Text>
          </View>

          <View style={[styles.statPod, { borderColor: 'rgba(37, 99, 235, 0.3)' }]}>
            <View style={styles.statPodHeader}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.statPodLabel}>On Leave</Text>
            </View>
            <Text style={[styles.statPodValue, { color: COLORS.primary }]}>
              {stats.leave}
            </Text>
          </View>

          <View style={[styles.statPod, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
            <View style={styles.statPodHeader}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.statPodLabel}>Absent</Text>
            </View>
            <Text style={[styles.statPodValue, { color: COLORS.danger }]}>
              {stats.absent}
            </Text>
          </View>

          <View style={[styles.statPod, { borderColor: 'rgba(100, 116, 139, 0.2)' }]}>
            <View style={styles.statPodHeader}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.textMuted }]} />
              <Text style={styles.statPodLabel}>Total</Text>
            </View>
            <Text style={[styles.statPodValue, { color: COLORS.textPrimary }]}>
              {stats.total}
            </Text>
          </View>
        </View>

        {/* Quick Batch Actions */}
        <View style={styles.batchActionsRow}>
          <TouchableOpacity
            style={styles.batchBtn}
            onPress={handleMarkAllPresent}
            activeOpacity={0.8}
          >
            <CheckCheck size={14} color={COLORS.primaryDark} style={{ marginRight: 6 }} />
            <Text style={styles.batchBtnText}>Mark In-Hostel Present</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <RotateCcw size={13} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.resetBtnText}>Reset</Text>
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

            const activeLeave = (leaveRequests || []).find(
              (l) =>
                l.studentId === student.id &&
                (l.status === LEAVE_STATUS.CHECKED_OUT ||
                  l.status === LEAVE_STATUS.WARDEN_APPROVED ||
                  l.status === LEAVE_STATUS.EXTENSION_PENDING)
            );

            return (
              <View key={student.id} style={styles.studentCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.88)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.studentCardInner}
                >
                  <View style={styles.cardGloss} />

                  {/* Student Top Row */}
                  <View style={styles.studentInfoRow}>
                    <ProfileAvatar
                      uri={student.avatar}
                      name={student.name}
                      size={44}
                      status={isPresent ? 'present' : isAbsent ? 'outside' : 'outside'}
                    />

                    <View style={styles.studentMeta}>
                      <View style={styles.nameBadgeRow}>
                        <Text style={styles.studentName} numberOfLines={1}>
                          {student.name}
                        </Text>
                        <View style={styles.roomTag}>
                          <Building size={11} color={COLORS.primary} style={{ marginRight: 3 }} />
                          <Text style={styles.roomTagText}>{student.roomNo}</Text>
                        </View>
                      </View>
                      <Text style={styles.enrollmentText}>
                        {student.enrollmentNo} • {student.department || 'CSE'}
                      </Text>
                    </View>
                  </View>

                  {/* On Leave Notice Banner */}
                  {activeLeave && (
                    <View style={styles.leaveBanner}>
                      <Plane size={12} color={COLORS.primary} style={{ marginRight: 5 }} />
                      <Text style={styles.leaveBannerText} numberOfLines={1}>
                        Pass #{activeLeave.passId || activeLeave.id}: {activeLeave.leaveType} ({activeLeave.reason})
                      </Text>
                    </View>
                  )}

                  {/* 3-Way Liquid Glass Roll-Call Toggle */}
                  <View style={styles.toggleRow}>
                    {/* PRESENT BUTTON */}
                    <TouchableOpacity
                      onPress={() => setStudentStatus(student.id, 'PRESENT')}
                      style={[
                        styles.toggleBtn,
                        isPresent && styles.presentBtnActive,
                      ]}
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

                    {/* ON LEAVE BUTTON */}
                    <TouchableOpacity
                      onPress={() => setStudentStatus(student.id, 'ON_LEAVE')}
                      style={[
                        styles.toggleBtn,
                        isOnLeave && styles.leaveBtnActive,
                      ]}
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

                    {/* ABSENT BUTTON */}
                    <TouchableOpacity
                      onPress={() => setStudentStatus(student.id, 'ABSENT')}
                      style={[
                        styles.toggleBtn,
                        isAbsent && styles.absentBtnActive,
                      ]}
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Finalize Bar */}
      <View style={styles.bottomBar}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.96)', 'rgba(240, 246, 255, 0.92)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bottomBarInner}
        >
          <View style={styles.cardGloss} />

          <View style={styles.bottomSummary}>
            <Text style={styles.summaryTitle}>Roll-Call Summary</Text>
            <Text style={styles.summaryNumbers}>
              {stats.present} Present • {stats.leave} Leave • {stats.absent} Absent
            </Text>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={COLORS.gradients.liquidBlue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              <Send size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.submitText}>Save & Finalize</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Roll-Call Finalized!"
        message={`Attendance for ${stats.total} students recorded successfully (${submissionStats.present} Present, ${submissionStats.leave} On Leave, ${submissionStats.absent} Absent). Parent notifications dispatched.`}
        buttonText="Back to Dashboard"
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/(warden)/dashboard');
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
  ambientContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ambientOrb1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  ambientOrb2: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
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
  selectorCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  selectorInner: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  compliancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  compliancePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.successDark,
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
    marginBottom: 12,
  },
  statPod: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statPodValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  batchActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  batchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(219, 234, 254, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.7)',
  },
  batchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studentCardInner: {
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentMeta: {
    flex: 1,
    marginLeft: 12,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
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
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  leaveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  leaveBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  presentBtnActive: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  leaveBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  absentBtnActive: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },
  bottomBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
    overflow: 'hidden',
  },
  bottomSummary: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  submitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
