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
import LeaveRequestCard from '../../components/cards/LeaveRequestCard';
import MiniBarChart from '../../components/charts/MiniBarChart';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import {
  Users,
  Building,
  UserCheck,
  UserMinus,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  ArrowRight,
  Shield,
  ClipboardCheck,
} from 'lucide-react-native';

export default function WardenDashboard() {
  const router = useRouter();
  const { stats, leaveRequests, activities, currentUser } = useApp();

  const pendingWardenReview = leaveRequests.filter(
    (r) => r.status === LEAVE_STATUS.PARENT_APPROVED
  );

  const overdueList = leaveRequests.filter(
    (r) => r.status === LEAVE_STATUS.CHECKED_OUT && r.expectedReturnDate < '2026-11-23'
  );

  const recentActivities = activities.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.ambientContainer}>
        <View style={styles.ambientOrb1} />
        <View style={styles.ambientOrb2} />
      </View>

      <AppHeader
        title="HostelEase"
        subtitle={`Chief Warden Admin • ${currentUser?.name || 'Dr. Upadhyay'}`}
        showLogout={true}
        notificationRoute="/(warden)/notifications"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overdue Alert Banner if any students are late */}
        {overdueList.length > 0 && (
          <TouchableOpacity
            style={styles.overdueTouchable}
            onPress={() => router.push('/(warden)/reports')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradients.liquidDanger}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.overdueBanner}
            >
              <View style={styles.bannerGloss} />
              <AlertTriangle size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.overdueTitle}>
                  {overdueList.length} Student{overdueList.length > 1 ? 's' : ''} Overdue for Return!
                </Text>
                <Text style={styles.overdueSub}>
                  Tap to view overdue gate report & emergency contacts
                </Text>
              </View>
              <ArrowRight size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Daily Roll-Call Attendance Quick Action */}
        <TouchableOpacity
          style={styles.rollCallCard}
          onPress={() => router.push('/(warden)/attendance')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(238, 246, 255, 0.88)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rollCallInner}
          >
            <View style={styles.cardGloss} />
            <View style={styles.rollCallLeft}>
              <LinearGradient
                colors={COLORS.gradients.liquidCyan}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rollCallIconCircle}
              >
                <ClipboardCheck size={22} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.rollCallTextGroup}>
                <View style={styles.rollCallTitleRow}>
                  <Text style={styles.rollCallTitle}>Daily Roll-Call Attendance</Text>
                  <View style={styles.liveBadge}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.liveBadgeText}>Night Session</Text>
                  </View>
                </View>
                <Text style={styles.rollCallSub}>
                  Fill up & verify physical attendance for all hostel students
                </Text>
              </View>
            </View>
            <ArrowRight size={18} color={COLORS.primary} />
          </LinearGradient>
        </TouchableOpacity>

        {/* 6 Key Analytics Cards */}
        <Text style={styles.analyticsHeading}>HOSTEL OVERVIEW</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            subtitle="Registered residents"
            icon={Users}
            color={COLORS.primary}
            style={styles.statCol}
          />
          <StatCard
            title="Present in Hostel"
            value={stats.presentInHostel}
            subtitle="Checked in campus"
            icon={UserCheck}
            color={COLORS.success}
            style={styles.statCol}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Currently Outside"
            value={stats.currentlyOutside}
            subtitle="Active gate passes"
            icon={UserMinus}
            color={COLORS.warning}
            style={styles.statCol}
          />
          <StatCard
            title="Pending Clearance"
            value={pendingWardenReview.length}
            subtitle="Parent approved"
            icon={Clock}
            color={COLORS.indigo}
            style={styles.statCol}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Returns Expected"
            value={stats.expectedReturnsToday}
            subtitle="Scheduled today"
            icon={Calendar}
            color="#0284C7"
            style={styles.statCol}
          />
          <StatCard
            title="Overdue Returns"
            value={stats.overdueStudents}
            subtitle="Late arrivals"
            icon={AlertTriangle}
            color={COLORS.danger}
            style={styles.statCol}
          />
        </View>

        {/* Quick Management Shortcuts */}
        <SectionHeader title="Administrative Actions" style={{ marginTop: 12 }} />
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(warden)/students')}
            activeOpacity={0.75}
          >
            <View style={styles.cardGloss} />
            <LinearGradient
              colors={['rgba(219, 234, 254, 0.9)', 'rgba(191, 219, 254, 0.6)']}
              style={styles.quickIconCircle}
            >
              <Users size={18} color={COLORS.primary} />
            </LinearGradient>
            <Text style={styles.quickTitle}>Students</Text>
            <Text style={styles.quickSub}>Directory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(warden)/leave-requests')}
            activeOpacity={0.75}
          >
            <View style={styles.cardGloss} />
            <LinearGradient
              colors={['rgba(209, 250, 229, 0.9)', 'rgba(167, 243, 208, 0.6)']}
              style={styles.quickIconCircle}
            >
              <FileText size={18} color="#059669" />
            </LinearGradient>
            <Text style={styles.quickTitle}>Gate Passes</Text>
            <Text style={styles.quickSub}>{pendingWardenReview.length} Ready</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(warden)/rooms')}
            activeOpacity={0.75}
          >
            <View style={styles.cardGloss} />
            <LinearGradient
              colors={['rgba(245, 243, 255, 0.9)', 'rgba(233, 213, 255, 0.6)']}
              style={styles.quickIconCircle}
            >
              <Building size={18} color="#7C3AED" />
            </LinearGradient>
            <Text style={styles.quickTitle}>Rooms</Text>
            <Text style={styles.quickSub}>Occupancy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(warden)/guards')}
            activeOpacity={0.75}
          >
            <View style={styles.cardGloss} />
            <LinearGradient
              colors={['rgba(254, 243, 199, 0.9)', 'rgba(253, 230, 138, 0.6)']}
              style={styles.quickIconCircle}
            >
              <Shield size={18} color="#D97706" />
            </LinearGradient>
            <Text style={styles.quickTitle}>Guards</Text>
            <Text style={styles.quickSub}>Roster</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(warden)/attendance')}
            activeOpacity={0.75}
          >
            <View style={styles.cardGloss} />
            <LinearGradient
              colors={['rgba(219, 234, 254, 0.95)', 'rgba(191, 219, 254, 0.7)']}
              style={styles.quickIconCircle}
            >
              <ClipboardCheck size={18} color={COLORS.primary} />
            </LinearGradient>
            <Text style={styles.quickTitle}>Attendance</Text>
            <Text style={styles.quickSub}>Roll-Call</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Warden Clearance List */}
        <SectionHeader
          title="Pending Gate Clearance"
          actionText="View All"
          onActionPress={() => router.push('/(warden)/leave-requests')}
          style={{ marginTop: 14 }}
        />

        {pendingWardenReview.length > 0 ? (
          pendingWardenReview.slice(0, 2).map((req) => (
            <LeaveRequestCard
              key={req.id}
              request={req}
              onPress={() =>
                router.push({
                  pathname: '/(warden)/leave-details',
                  params: { id: req.id },
                })
              }
              style={{ marginBottom: 12 }}
            />
          ))
        ) : (
          <View style={styles.allClearCard}>
            <Text style={styles.allClearText}>
              All parent-approved requests have been processed.
            </Text>
          </View>
        )}

        {/* Weekly Chart */}
        <MiniBarChart
          title="Weekly Hostel Gate Exits"
          style={{ marginTop: 14, marginBottom: 14 }}
        />

        {/* Live Activity Feed */}
        <SectionHeader
          title="Live Hostel Activities"
          actionText="See Live Feed"
          onActionPress={() => router.push('/(warden)/activities')}
        />

        {recentActivities.length > 0 ? (
          recentActivities.map((act) => (
            <View key={act.id} style={styles.activityCard}>
              <View style={styles.cardGloss} />
              <View style={styles.activityDot} />
              <View style={styles.activityBody}>
                <View style={styles.activityHeader}>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  <Text style={styles.actTime}>{act.timestamp}</Text>
                </View>
                <Text style={styles.actStudent}>
                  {act.studentName} ({act.roomNo})
                </Text>
                <Text style={styles.actDesc}>{act.description}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.allClearCard}>
            <Text style={styles.allClearText}>No recent movements or activity recorded yet.</Text>
          </View>
        )}
      </ScrollView>

      <RoleTabBar role="warden" />
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
    top: -50,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(191, 219, 254, 0.4)',
  },
  ambientOrb2: {
    position: 'absolute',
    top: 320,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(238, 242, 255, 0.45)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  analyticsHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  overdueTouchable: {
    borderRadius: 16,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 14,
  },
  overdueBanner: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
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
  overdueTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  overdueSub: {
    fontSize: 11.5,
    color: '#FEE2E2',
    marginTop: 1,
  },
  rollCallCard: {
    marginHorizontal: 0,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  rollCallInner: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  rollCallLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  rollCallIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rollCallTextGroup: {
    flex: 1,
  },
  rollCallTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rollCallTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
    marginRight: 4,
  },
  liveBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  rollCallSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCol: {
    flex: 1,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardGloss: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  quickIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  quickSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
    fontWeight: '500',
  },
  allClearCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  allClearText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activityCard: {
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
  activityBody: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actTime: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  actStudent: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  actDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
