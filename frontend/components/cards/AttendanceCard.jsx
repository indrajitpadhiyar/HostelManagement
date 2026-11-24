import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  X,
  Info,
} from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

export default function AttendanceCard({ attendance, onCardPress }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL | PRESENT | ON_LEAVE | ABSENT

  const stats = attendance?.stats || {
    totalDays: 0,
    presentDays: 0,
    leaveDays: 0,
    absentDays: 0,
    attendanceRate: 100,
    streak: 0,
    complianceStatus: 'GOOD',
    minimumRequired: 75,
  };

  const today = attendance?.today || null;

  const weeklyStrip = attendance?.weeklyStrip || [];
  const records = attendance?.records || [];

  const filteredRecords = records.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return COLORS.success;
      case 'ON_LEAVE':
        return COLORS.primary;
      case 'ABSENT':
        return COLORS.danger;
      default:
        return COLORS.textMuted;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'rgba(16, 185, 129, 0.12)';
      case 'ON_LEAVE':
        return 'rgba(37, 99, 235, 0.12)';
      case 'ABSENT':
        return 'rgba(239, 68, 68, 0.12)';
      default:
        return 'rgba(148, 163, 184, 0.12)';
    }
  };

  return (
    <>
      {/* Main Liquid Glass Attendance Card */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 247, 255, 0.82)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardInner}
        >
          {/* Glass specular top reflection */}
          <View style={styles.topGloss} />

          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrapper}>
                <LinearGradient
                  colors={COLORS.gradients.liquidCyan}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Calendar size={18} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.title}>Hostel Attendance</Text>
                <Text style={styles.subtitle}>
                  {attendance?.periodLabel || 'November 2026'} • Roll-Call
                </Text>
              </View>
            </View>

            <View style={styles.badgeWrapper}>
              <View style={styles.pulseDot} />
              <Text style={styles.badgeText}>{stats.attendanceRate}% Rate</Text>
            </View>
          </View>

          {/* Core Gauge & Stats Section */}
          <View style={styles.statsRow}>
            {/* Liquid Circular Rate Pod */}
            <View style={styles.gaugeContainer}>
              <LinearGradient
                colors={['rgba(37, 99, 235, 0.14)', 'rgba(6, 182, 212, 0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gaugeCircle}
              >
                <Text style={styles.rateNumber}>{stats.attendanceRate}%</Text>
                <Text style={styles.rateLabel}>Compliance</Text>
              </LinearGradient>
              <View style={styles.complianceTag}>
                <ShieldCheck size={11} color={COLORS.success} style={{ marginRight: 3 }} />
                <Text style={styles.complianceText}>Required: 75%</Text>
              </View>
            </View>

            {/* Micro Breakdown Metrics Pods */}
            <View style={styles.metricsColumn}>
              <View style={styles.streakBadge}>
                <LinearGradient
                  colors={['#FEF3C7', '#FDE68A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.streakGradient}
                >
                  <Flame size={13} color="#D97706" style={{ marginRight: 4 }} />
                  <Text style={styles.streakText}>{stats.streak} Days Streak!</Text>
                </LinearGradient>
              </View>

              <View style={styles.statPillsRow}>
                <View style={[styles.statPill, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                  <Text style={[styles.statPillValue, { color: COLORS.success }]}>
                    {stats.presentDays}
                  </Text>
                  <Text style={styles.statPillLabel}>Present</Text>
                </View>

                <View style={[styles.statPill, { borderColor: 'rgba(37, 99, 235, 0.3)' }]}>
                  <Text style={[styles.statPillValue, { color: COLORS.primary }]}>
                    {stats.leaveDays}
                  </Text>
                  <Text style={styles.statPillLabel}>Leaves</Text>
                </View>

                <View style={[styles.statPill, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                  <Text style={[styles.statPillValue, { color: COLORS.danger }]}>
                    {stats.absentDays}
                  </Text>
                  <Text style={styles.statPillLabel}>Absent</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Today's Roll-Call Status Banner */}
          {today ? (
            <LinearGradient
              colors={
                today.status === 'ABSENT'
                  ? ['rgba(254, 242, 242, 0.9)', 'rgba(254, 226, 226, 0.7)']
                  : today.status === 'ON_LEAVE'
                  ? ['rgba(239, 246, 255, 0.9)', 'rgba(219, 234, 254, 0.7)']
                  : ['rgba(240, 253, 244, 0.85)', 'rgba(220, 252, 231, 0.65)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.todayBanner}
            >
              <View style={styles.todayLeft}>
                <View style={styles.todayIconCircle}>
                  <CheckCircle2
                    size={15}
                    color={
                      today.status === 'ABSENT'
                        ? COLORS.danger
                        : today.status === 'ON_LEAVE'
                        ? COLORS.primary
                        : COLORS.success
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.todayTitle}>
                    Today: {today.status === 'ON_LEAVE' ? 'On Authorized Leave' : today.status === 'ABSENT' ? 'Marked Absent' : 'Marked Present'}{today.markedAt && today.markedAt !== '-' ? ` (${today.markedAt})` : ''}
                  </Text>
                  <Text style={styles.todaySub} numberOfLines={1}>
                    {today.markedBy || 'Warden'} • Verified in hostel
                  </Text>
                </View>
              </View>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={['rgba(248, 250, 252, 0.9)', 'rgba(241, 245, 249, 0.75)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.todayBanner}
            >
              <View style={styles.todayLeft}>
                <View style={[styles.todayIconCircle, { backgroundColor: 'rgba(100, 116, 139, 0.12)' }]}>
                  <Clock size={15} color={COLORS.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.todayTitle, { color: COLORS.textSecondary }]}>
                    Today's Roll-Call: Pending
                  </Text>
                  <Text style={styles.todaySub} numberOfLines={1}>
                    Physical attendance call is conducted nightly at 08:30 PM
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* 7-Day Weekly Strip */}
          <View style={styles.weekSection}>
            <Text style={styles.weekLabel}>PAST 7 DAYS ACTIVITY</Text>
            {weeklyStrip.length > 0 ? (
              <View style={styles.weekRow}>
                {weeklyStrip.map((item, idx) => {
                  const color = getStatusColor(item.status);
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.dayPod,
                        item.isToday && styles.todayPodActive,
                      ]}
                    >
                      <Text style={[styles.dayText, item.isToday && styles.todayDayText]}>
                        {item.day}
                      </Text>
                      <Text
                        style={[
                          styles.dayNumber,
                          item.isToday && { color: COLORS.primaryDark, fontWeight: '700' },
                        ]}
                      >
                        {item.dayNumber}
                      </Text>
                      <View style={[styles.statusDot, { backgroundColor: color }]} />
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                  No roll-call sessions recorded yet this week.
                </Text>
              </View>
            )}
          </View>

          {/* View Full History Button */}
          <TouchableOpacity
            style={styles.viewHistoryButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.viewHistoryText}>View Monthly Attendance Log</Text>
            <ChevronRight size={15} color={COLORS.primary} />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Comprehensive Attendance Log Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.modalContent}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Attendance History</Text>
                  <Text style={styles.modalSubtitle}>
                    {attendance?.periodLabel || 'November 2026'} • Detailed Log
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Policy Alert Box */}
              <View style={styles.policyBox}>
                <Info size={16} color={COLORS.primary} style={{ marginRight: 8, marginTop: 1 }} />
                <Text style={styles.policyText}>
                  Hostel Regulation §4.2: Minimum 75% physical attendance in night roll-calls is required for semester hostel re-allotment and exam clearance.
                </Text>
              </View>

              {/* Filter Tabs */}
              <View style={styles.filterTabsRow}>
                {['ALL', 'PRESENT', 'ON_LEAVE', 'ABSENT'].map((tab) => {
                  const isActive = filter === tab;
                  const label =
                    tab === 'ALL'
                      ? `All (${records.length})`
                      : tab === 'PRESENT'
                      ? `Present (${stats.presentDays})`
                      : tab === 'ON_LEAVE'
                      ? `Leave (${stats.leaveDays})`
                      : `Absent (${stats.absentDays})`;
                  return (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setFilter(tab)}
                      style={[styles.filterTab, isActive && styles.filterTabActive]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterTabText,
                          isActive && styles.filterTabTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Records List */}
              <ScrollView
                style={styles.recordsList}
                showsVerticalScrollIndicator={false}
              >
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((item) => {
                    const color = getStatusColor(item.status);
                    const bg = getStatusBg(item.status);
                    return (
                      <View key={item.id} style={styles.recordItem}>
                        <View style={styles.recordLeft}>
                          <View style={[styles.recordBadge, { backgroundColor: bg }]}>
                            <Text style={[styles.recordBadgeText, { color }]}>
                              {item.status.replace('_', ' ')}
                            </Text>
                          </View>
                          <View style={{ marginLeft: 10 }}>
                            <Text style={styles.recordDate}>{item.date}</Text>
                            <Text style={styles.recordRemarks}>{item.remarks}</Text>
                          </View>
                        </View>
                        <View style={styles.recordRight}>
                          <Text style={styles.recordTime}>{item.time}</Text>
                          <Text style={styles.recordMarkedBy} numberOfLines={1}>
                            {item.markedBy}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: COLORS.textMuted }}>
                      No attendance records found for this period.
                    </Text>
                  </View>
                )}
                <View style={{ height: 24 }} />
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  cardInner: {
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  iconGradient: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.successDark,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  gaugeCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  rateNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: -0.5,
  },
  rateLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  complianceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  complianceText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  metricsColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  streakBadge: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  statPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: 3,
  },
  statPillValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statPillLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  todayBanner: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 14,
  },
  todayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  todayTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.successDark,
  },
  todaySub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  weekSection: {
    marginBottom: 12,
  },
  weekLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPod: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  todayPodActive: {
    backgroundColor: 'rgba(219, 234, 254, 0.85)',
    borderColor: COLORS.primaryLight,
    borderWidth: 1.5,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  todayDayText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 3,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
    marginTop: 4,
  },
  viewHistoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '85%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  policyBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 16,
  },
  policyText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
  },
  filterTabsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recordsList: {
    maxHeight: 380,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recordBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  recordDate: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  recordRemarks: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  recordRight: {
    alignItems: 'flex-end',
  },
  recordTime: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  recordMarkedBy: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
