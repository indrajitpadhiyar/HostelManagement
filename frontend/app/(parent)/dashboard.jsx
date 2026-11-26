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
import RoleTabBar from '../../components/navigation/RoleTabBar';
import {
  CheckSquare,
  Clock,
  ArrowRight,
  AlertCircle,
  Calendar,
} from 'lucide-react-native';

export default function ParentDashboard() {
  const router = useRouter();
  const { currentUser, students, leaveRequests, activities } = useApp();

  const child =
    students.find((s) => s.id === currentUser?.studentId || s._id === currentUser?.studentId) ||
    currentUser?.child ||
    null;
  const childLeaves = child
    ? leaveRequests.filter((r) => r.studentId === child.id || r.studentId === child._id)
    : leaveRequests;

  const pendingApprovals = childLeaves.filter(
    (r) =>
      r.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL ||
      r.status === LEAVE_STATUS.EXTENSION_PENDING
  );

  const activeLeave = childLeaves.find(
    (r) =>
      r.status === LEAVE_STATUS.CHECKED_OUT ||
      r.status === LEAVE_STATUS.EXTENSION_PENDING ||
      r.status === LEAVE_STATUS.WARDEN_APPROVED
  );

  const childActivities = child
    ? activities
        .filter((a) => a.studentName === child.name || a.enrollmentNo === child.enrollmentNo)
        .slice(0, 4)
    : activities.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.ambientContainer}>
        <View style={styles.ambientOrb1} />
        <View style={styles.ambientOrb2} />
      </View>

      <AppHeader
        title="HostelEase"
        subtitle="Parent Portal"
        showLogout={true}
        notificationRoute="/(parent)/notifications"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Child Profile Frosted Glass Card */}
        <View style={styles.glassChildCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 246, 255, 0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.childCardInner}
          >
            <View style={styles.topGloss} />
            <Text style={styles.parentGreeting}>Logged in as {currentUser?.name || 'Parent'}</Text>

            {child ? (
              <>
                <View style={styles.childHeaderRow}>
                  <ProfileAvatar
                    uri={child.avatar}
                    name={child.name}
                    size={58}
                    status={child.hostelStatus === HOSTEL_STATUS.PRESENT ? 'present' : 'outside'}
                  />
                  <View style={styles.childTextWrapper}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childEnrollment}>
                      {child.enrollmentNo} • {child.deptCode || 'CSE'}
                    </Text>
                    <Text style={styles.childRoom}>
                      Room {child.roomNo} ({child.block || 'Block A'})
                    </Text>
                  </View>
                </View>

                <LinearGradient
                  colors={['rgba(240, 246, 255, 0.9)', 'rgba(230, 240, 255, 0.7)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.childStatusRow}
                >
                  <View style={styles.statusCol}>
                    <Text style={styles.statusColLabel}>CURRENT HOSTEL STATUS</Text>
                    <StatusBadge
                      status={child.hostelStatus}
                      isHostelStatus={true}
                      size="small"
                    />
                  </View>

                  <View style={styles.statusDivider} />

                  <View style={styles.statusCol}>
                    <Text style={styles.statusColLabel}>ACTIVE PASS</Text>
                    <Text style={styles.activePassText}>
                      {activeLeave ? activeLeave.reason : 'No Active Pass'}
                    </Text>
                  </View>
                </LinearGradient>
              </>
            ) : (
              <View style={{ paddingVertical: 14 }}>
                <Text style={styles.childName}>No Student Record Linked</Text>
                <Text style={[styles.childEnrollment, { marginTop: 4 }]}>
                  Your registered student will automatically link here once enrolled.
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Pending Approvals Liquid Danger Banner */}
        {pendingApprovals.length > 0 && (
          <TouchableOpacity
            style={styles.pendingTouchable}
            onPress={() => router.push('/(parent)/approvals')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={COLORS.gradients.liquidDanger}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pendingBanner}
            >
              <View style={styles.bannerGloss} />
              <View style={styles.pendingLeft}>
                <View style={styles.pendingIconCircle}>
                  <AlertCircle size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pendingTitle}>
                    {pendingApprovals.length} Request{pendingApprovals.length > 1 ? 's' : ''} Awaiting Approval
                  </Text>
                  <Text style={styles.pendingSub}>
                    Tap to review and authorize or decline leave pass
                  </Text>
                </View>
              </View>
              <ArrowRight size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Expected Return Date Glass Card */}
        {activeLeave && (
          <View style={styles.glassReturnCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 248, 255, 0.85)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.returnInner}
            >
              <View style={styles.topGloss} />
              <View style={styles.returnHeader}>
                <Calendar size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.returnHeaderTitle}>Expected Return Information</Text>
              </View>
              <Text style={styles.returnDate}>{activeLeave.expectedReturnDate}</Text>
              <Text style={styles.returnDestination}>
                Destination: {activeLeave.destinationAddress}, {activeLeave.destinationCity}
              </Text>
              <Text style={styles.returnEmergency}>
                Emergency Phone: {activeLeave.emergencyContact}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/approvals')}
            activeOpacity={0.75}
          >
            <View style={styles.topGloss} />
            <LinearGradient
              colors={['rgba(219, 234, 254, 0.9)', 'rgba(191, 219, 254, 0.6)']}
              style={styles.actionIconCircle}
            >
              <CheckSquare size={20} color={COLORS.primary} />
            </LinearGradient>
            <Text style={styles.actionTitle}>Leave Approvals</Text>
            <Text style={styles.actionSub}>
              {pendingApprovals.length} Pending Actions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/history')}
            activeOpacity={0.75}
          >
            <View style={styles.topGloss} />
            <LinearGradient
              colors={['rgba(209, 250, 229, 0.9)', 'rgba(167, 243, 208, 0.6)']}
              style={styles.actionIconCircle}
            >
              <Clock size={20} color="#059669" />
            </LinearGradient>
            <Text style={styles.actionTitle}>Approval History</Text>
            <Text style={styles.actionSub}>
              {childLeaves.length} Total Passes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Child Activities */}
        <SectionHeader
          title="Child's Recent Activity"
          actionText="Approvals"
          onActionPress={() => router.push('/(parent)/approvals')}
          style={{ marginTop: 18 }}
        />

        {childActivities.length > 0 ? (
          childActivities.map((act) => (
            <View key={act.id} style={styles.activityItem}>
              <View style={styles.topGloss} />
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <View style={styles.activityTop}>
                  <Text style={styles.activityTitle}>{act.title}</Text>
                  <Text style={styles.activityTime}>{act.timestamp}</Text>
                </View>
                <Text style={styles.activityDesc}>{act.description}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent activity logged for your child.</Text>
          </View>
        )}
      </ScrollView>

      <RoleTabBar role="parent" />
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
  ambientOrb1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(254, 226, 226, 0.4)',
  },
  ambientOrb2: {
    position: 'absolute',
    top: 260,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(219, 234, 254, 0.35)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  glassChildCard: {
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
  childCardInner: {
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
  parentGreeting: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  childHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childTextWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontSize: 17.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  childEnrollment: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  childRoom: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  childStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  statusCol: {
    flex: 1,
  },
  statusColLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  activePassText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(203, 213, 225, 0.7)',
    marginHorizontal: 10,
  },
  pendingTouchable: {
    borderRadius: 18,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 14,
  },
  pendingBanner: {
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
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  pendingIconCircle: {
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
  pendingTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pendingSub: {
    fontSize: 11.5,
    color: '#FEE2E2',
    marginTop: 2,
    fontWeight: '500',
  },
  glassReturnCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  returnInner: {
    padding: 16,
    position: 'relative',
  },
  returnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  returnHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  returnDate: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  returnDestination: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  returnEmergency: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    position: 'relative',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  actionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  actionSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    position: 'relative',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 5,
    marginRight: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  activityTime: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  activityDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
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
  },
});
