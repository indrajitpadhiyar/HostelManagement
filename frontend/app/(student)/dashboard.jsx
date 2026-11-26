import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import { LEAVE_STATUS, HOSTEL_STATUS } from '../../constants/config';
import AppHeader from '../../components/common/AppHeader';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import StatusBadge from '../../components/common/StatusBadge';
import SectionHeader from '../../components/common/SectionHeader';
import LeaveRequestCard from '../../components/cards/LeaveRequestCard';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import AttendanceCard from '../../components/cards/AttendanceCard';
import {
  PlusCircle,
  Clock,
  ArrowRight,
  Building,
  Bell,
  Sparkles,
} from 'lucide-react-native';

export default function StudentDashboard() {
  const router = useRouter();
  const { currentUser, students, leaveRequests, notifications, attendance } = useApp();

  const student =
    students.find((s) => s.id === currentUser?.id || s.id === currentUser?.studentId) ||
    currentUser || {
      id: currentUser?.id || '',
      name: currentUser?.name || 'Student',
      avatar: currentUser?.avatar,
      enrollmentNo: currentUser?.enrollmentNo || '',
      roomNo: currentUser?.roomNo || 'Unassigned',
      hostelStatus: currentUser?.hostelStatus || HOSTEL_STATUS.PRESENT,
      semester: currentUser?.semester || '',
      deptCode: currentUser?.department || 'ENG',
    };
  const myLeaves = (leaveRequests || []).filter((r) => r.studentId === student?.id);

  const activeLeave = myLeaves.find(
    (r) =>
      r.status === LEAVE_STATUS.CHECKED_OUT ||
      r.status === LEAVE_STATUS.EXTENSION_PENDING ||
      r.status === LEAVE_STATUS.WARDEN_APPROVED ||
      r.status === LEAVE_STATUS.PARENT_APPROVED
  );

  const recentLeaves = myLeaves.slice(0, 3);
  const unreadNotif = (notifications || []).find((n) => n.userId === student?.id && !n.read);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Ambient liquid background glow */}
      <View pointerEvents="none" style={styles.ambientContainer}>
        <View style={styles.ambientGlow1} />
        <View style={styles.ambientGlow2} />
      </View>

      <AppHeader
        title="HostelEase"
        subtitle="Student Portal"
        showLogout={true}
        notificationRoute="/(student)/notifications"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Liquid Glass Profile Card */}
        <View style={styles.glassProfileCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 246, 255, 0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileInner}
          >
            <View style={styles.topGloss} />

            <View style={styles.profileTopRow}>
              <TouchableOpacity
                onPress={() => router.push('/(student)/profile')}
                activeOpacity={0.8}
              >
                <ProfileAvatar
                  uri={student.avatar}
                  name={student.name}
                  size={56}
                  status={student.hostelStatus === HOSTEL_STATUS.PRESENT ? 'present' : 'outside'}
                />
              </TouchableOpacity>

              <View style={styles.profileTextWrapper}>
                <Text style={styles.greeting}>Welcome,</Text>
                <Text style={styles.studentName} numberOfLines={1}>
                  {student.name}
                </Text>
                <Text style={styles.enrollment}>
                  {student.enrollmentNo} • {student.deptCode || 'CSE'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.roomBadge}
                onPress={() => router.push('/(student)/profile')}
                activeOpacity={0.7}
              >
                <Building size={12} color={COLORS.primary} style={{ marginRight: 3 }} />
                <Text style={styles.roomText}>{student.roomNo}</Text>
              </TouchableOpacity>
            </View>

            {/* Status & Quick Tags */}
            <View style={styles.profileBottomRow}>
              <View style={styles.hostelStatusWrapper}>
                <Text style={styles.statusLabel}>Hostel Status:</Text>
                <StatusBadge
                  status={student.hostelStatus}
                  isHostelStatus={true}
                  size="small"
                />
              </View>

              <Text style={styles.semesterTag}>{student.semester}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Liquid Gradient Quick Action Banner */}
        <TouchableOpacity
          onPress={() => router.push('/(student)/apply-leave')}
          activeOpacity={0.85}
          style={styles.applyTouchable}
        >
          <LinearGradient
            colors={COLORS.gradients.liquidBlue}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.applyBanner}
          >
            <View style={styles.bannerGloss} />
            <View style={styles.applyBannerLeft}>
              <View style={styles.applyIconCircle}>
                <PlusCircle size={24} color="#FFFFFF" />
              </View>
              <View style={styles.applyTextWrapper}>
                <Text style={styles.applyTitle}>Apply for Leave Pass</Text>
                <Text style={styles.applySub}>
                  Digital leave clearance with multi-tier approval
                </Text>
              </View>
            </View>
            <ArrowRight size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Notification Alert Ticker */}
        {unreadNotif && (
          <TouchableOpacity
            style={styles.notifBanner}
            onPress={() => router.push('/(student)/notifications')}
            activeOpacity={0.8}
          >
            <View style={styles.topGloss} />
            <Bell size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.notifBannerText} numberOfLines={1}>
              {unreadNotif.title}: {unreadNotif.message}
            </Text>
          </TouchableOpacity>
        )}

        {/* Liquid Glass Attendance System Overview */}
        <AttendanceCard attendance={attendance} />

        {/* Liquid Active Leave Pass Card */}
        {activeLeave ? (
          <View style={styles.glassActiveCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.96)', 'rgba(238, 246, 255, 0.88)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activeInner}
            >
              <View style={styles.topGloss} />

              <View style={styles.activeHeader}>
                <View style={styles.activeLabelRow}>
                  <View style={styles.activePulse} />
                  <Text style={styles.activeHeaderTitle}>ACTIVE LEAVE PASS</Text>
                </View>
                <StatusBadge status={activeLeave.status} size="small" />
              </View>

              <Text style={styles.activeReason}>{activeLeave.reason}</Text>

              <LinearGradient
                colors={['rgba(239, 246, 255, 0.95)', 'rgba(224, 238, 255, 0.8)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.datesGrid}
              >
                <View style={styles.dateCol}>
                  <Text style={styles.dateColLabel}>DEPARTURE</Text>
                  <Text style={styles.dateColValue}>{activeLeave.departureDate}</Text>
                </View>
                <View style={styles.dateDivider} />
                <View style={styles.dateCol}>
                  <Text style={styles.dateColLabel}>EXPECTED RETURN</Text>
                  <Text style={[styles.dateColValue, { color: COLORS.primaryDark }]}>
                    {activeLeave.expectedReturnDate}
                  </Text>
                </View>
              </LinearGradient>

              <View style={styles.activeFooter}>
                <TouchableOpacity
                  style={styles.viewDetailsBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/(student)/leave-details',
                      params: { id: activeLeave.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewDetailsText}>View Digital Pass</Text>
                </TouchableOpacity>

                {activeLeave.status === LEAVE_STATUS.CHECKED_OUT && (
                  <TouchableOpacity
                    style={styles.extendTouchable}
                    onPress={() =>
                      router.push({
                        pathname: '/(student)/extend-leave',
                        params: { id: activeLeave.id },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={COLORS.gradients.liquidBlue}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.extendBtnGradient}
                    >
                      <View style={styles.btnGloss} />
                      <Clock size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.extendBtnText}>Extend Leave</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>
        ) : null}

        {/* Recent Leave Requests */}
        <SectionHeader
          title="Recent Leave Requests"
          actionText="View All"
          onActionPress={() => router.push('/(student)/leave-history')}
          style={{ marginTop: 18 }}
        />

        {recentLeaves.length > 0 ? (
          recentLeaves.map((leave) => (
            <LeaveRequestCard
              key={leave.id}
              request={leave}
              onPress={() =>
                router.push({
                  pathname: '/(student)/leave-details',
                  params: { id: leave.id },
                })
              }
              style={{ marginBottom: 12 }}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No leave requests yet.</Text>
          </View>
        )}
      </ScrollView>

      <RoleTabBar role="student" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  ambientContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ambientGlow1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(191, 219, 254, 0.35)',
  },
  ambientGlow2: {
    position: 'absolute',
    top: 300,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(224, 231, 255, 0.4)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  glassProfileCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  profileInner: {
    padding: 16,
    position: 'relative',
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTextWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  studentName: {
    fontSize: 17.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  enrollment: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(219, 234, 254, 0.8)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  roomText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorderTint,
  },
  hostelStatusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  semesterTag: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  applyTouchable: {
    borderRadius: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 14,
  },
  applyBanner: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  bannerGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  applyBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  applyIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  applyTextWrapper: {
    flex: 1,
  },
  applyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  applySub: {
    fontSize: 11.5,
    color: '#E0E7FF',
    marginTop: 2,
    fontWeight: '500',
  },
  notifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    position: 'relative',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  notifBannerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  glassActiveCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(147, 197, 253, 0.7)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  activeInner: {
    padding: 18,
    position: 'relative',
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  activeHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  activeReason: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  datesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  dateCol: {
    flex: 1,
  },
  dateColLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  dateColValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dateDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(191, 219, 254, 0.8)',
    marginHorizontal: 12,
  },
  activeFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  viewDetailsBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  extendTouchable: {
    flex: 1,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  extendBtnGradient: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  btnGloss: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  extendBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
