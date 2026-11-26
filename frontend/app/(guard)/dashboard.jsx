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
import { LEAVE_STATUS } from '../../constants/config';
import AppHeader from '../../components/common/AppHeader';
import StatCard from '../../components/common/StatCard';
import SectionHeader from '../../components/common/SectionHeader';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import {
  LogOut,
  LogIn,
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react-native';

export default function GuardDashboard() {
  const router = useRouter();
  const { currentUser, stats, leaveRequests } = useApp();

  const waitingToExit = leaveRequests.filter(
    (r) =>
      (r.status === LEAVE_STATUS.WARDEN_APPROVED || r.status === LEAVE_STATUS.PARENT_APPROVED) &&
      !r.actualExitTime
  );

  const currentlyOutside = leaveRequests.filter(
    (r) => r.status === LEAVE_STATUS.CHECKED_OUT
  );

  const returnedToday = leaveRequests.filter(
    (r) => r.status === LEAVE_STATUS.CHECKED_IN && r.actualReturnTime?.includes('Today')
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.ambientContainer}>
        <View style={styles.ambientOrb1} />
        <View style={styles.ambientOrb2} />
      </View>

      <AppHeader
        title="Gate Security Terminal"
        subtitle={`${currentUser?.gateNumber || 'Main Gate 1'} • ${currentUser?.name || 'Security Guard'}`}
        showLogout={true}
        notificationRoute="/(guard)/notifications"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Liquid Glass Fast-Action Terminal Buttons */}
        <Text style={styles.sectionHeading}>RAPID GATE OPERATIONS</Text>

        <View style={styles.actionGrid}>
          {/* QR Scanner / Verify */}
          <TouchableOpacity
            style={styles.bigBtnTouchable}
            onPress={() => router.push('/(guard)/verify-student')}
            activeOpacity={0.82}
          >
            <LinearGradient
              colors={COLORS.gradients.liquidBlue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bigBtn}
            >
              <View style={styles.btnGloss} />
              <View style={styles.bigBtnIconCircle}>
                <QrCode size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bigBtnTitle}>Scan / Verify Student</Text>
                <Text style={styles.bigBtnSub}>Instant QR scan or Roll Search</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Record Exit */}
          <TouchableOpacity
            style={styles.bigBtnTouchable}
            onPress={() => router.push('/(guard)/gate-exit')}
            activeOpacity={0.82}
          >
            <LinearGradient
              colors={COLORS.gradients.liquidWarning}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bigBtn}
            >
              <View style={styles.btnGloss} />
              <View style={styles.bigBtnIconCircle}>
                <LogOut size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bigBtnTitle}>Record Gate Exit</Text>
                <Text style={styles.bigBtnSub}>
                  {waitingToExit.length} Approved & Ready
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Record Return */}
          <TouchableOpacity
            style={styles.bigBtnTouchable}
            onPress={() => router.push('/(guard)/gate-return')}
            activeOpacity={0.82}
          >
            <LinearGradient
              colors={COLORS.gradients.liquidSuccess}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bigBtn}
            >
              <View style={styles.btnGloss} />
              <View style={styles.bigBtnIconCircle}>
                <LogIn size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bigBtnTitle}>Record Gate Return</Text>
                <Text style={styles.bigBtnSub}>
                  {currentlyOutside.length} Currently Outside
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 4 Real-time Glass Terminal Counters */}
        <Text style={styles.sectionHeading}>TODAY'S TERMINAL LOGS</Text>
        <View style={styles.statsRow}>
          <StatCard
            title="Waiting to Exit"
            value={waitingToExit.length}
            subtitle="Cleared passes"
            icon={LogOut}
            color={COLORS.warning}
            style={styles.statCol}
          />
          <StatCard
            title="Currently Outside"
            value={currentlyOutside.length}
            subtitle="Campus perimeter"
            icon={Users}
            color="#C2410C"
            style={styles.statCol}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Returned Today"
            value={returnedToday.length}
            subtitle="Check-ins"
            icon={LogIn}
            color={COLORS.success}
            style={styles.statCol}
          />
          <StatCard
            title="Expected Returns"
            value={stats.expectedReturnsToday}
            subtitle="Scheduled by 10 PM"
            icon={Clock}
            color={COLORS.primary}
            style={styles.statCol}
          />
        </View>

        {/* Quick List: Students Waiting to Exit */}
        <SectionHeader
          title="Students Cleared for Exit"
          actionText="View All"
          onActionPress={() => router.push('/(guard)/approved-leaves')}
          style={{ marginTop: 12 }}
        />

        {waitingToExit.length > 0 ? (
          waitingToExit.slice(0, 3).map((req) => (
            <TouchableOpacity
              key={req.id}
              style={styles.exitCard}
              onPress={() =>
                router.push({
                  pathname: '/(guard)/gate-exit',
                  params: { selectedId: req.id },
                })
              }
              activeOpacity={0.78}
            >
              <View style={styles.topGloss} />
              <View style={styles.exitCardLeft}>
                <Text style={styles.studentName}>{req.studentName}</Text>
                <Text style={styles.studentSub}>
                  {req.enrollmentNo} • Room {req.roomNo}
                </Text>
                <Text style={styles.reasonText}>{req.reason}</Text>
              </View>

              <LinearGradient
                colors={COLORS.gradients.liquidBlue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exitActionBadge}
              >
                <Text style={styles.exitActionText}>Clear Exit</Text>
                <ArrowRight size={13} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <CheckCircle2 size={24} color={COLORS.success} />
            <Text style={styles.emptyText}>No students queued for exit clearance.</Text>
          </View>
        )}
      </ScrollView>

      <RoleTabBar role="guard" />
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
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(254, 243, 199, 0.45)',
  },
  ambientOrb2: {
    position: 'absolute',
    top: 260,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(209, 250, 229, 0.4)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  actionGrid: {
    gap: 10,
    marginBottom: 16,
  },
  bigBtnTouchable: {
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  bigBtn: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  btnGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bigBtnIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bigBtnTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  bigBtnSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 2,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCol: {
    flex: 1,
  },
  exitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    position: 'relative',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  exitCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  studentSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  exitActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  exitActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
});
