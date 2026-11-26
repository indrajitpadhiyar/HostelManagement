import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import { LEAVE_STATUS } from '../../constants/config';
import AppHeader from '../../components/common/AppHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import MiniBarChart from '../../components/charts/MiniBarChart';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import {
  FileText,
  Download,
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react-native';

export default function WardenReports() {
  const router = useRouter();
  const { stats, leaveRequests, students } = useApp();

  const [reportType, setReportType] = useState('daily'); // 'daily' | 'monthly' | 'attendance' | 'overdue'
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF'); // 'PDF' | 'CSV'

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueList = leaveRequests.filter(
    (r) => r.status === LEAVE_STATUS.CHECKED_OUT && r.expectedReturnDate < todayStr
  );

  const handleExportTrigger = (format) => {
    setExportFormat(format);
    setExportModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Hostel Analytics & Reports"
        subtitle="Institutional Audit Logs"
        showBack={true}
        onBack={() => router.back()}
      />

      {/* Report Selector Pills */}
      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={[styles.selectorPill, reportType === 'daily' && styles.selectorPillActive]}
          onPress={() => setReportType('daily')}
        >
          <Text
            style={[
              styles.selectorText,
              reportType === 'daily' && styles.selectorTextActive,
            ]}
          >
            Daily Leave
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.selectorPill, reportType === 'monthly' && styles.selectorPillActive]}
          onPress={() => setReportType('monthly')}
        >
          <Text
            style={[
              styles.selectorText,
              reportType === 'monthly' && styles.selectorTextActive,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.selectorPill, reportType === 'overdue' && styles.selectorPillActive]}
          onPress={() => setReportType('overdue')}
        >
          <Text
            style={[
              styles.selectorText,
              reportType === 'overdue' && styles.selectorTextActive,
            ]}
          >
            Overdue ({overdueList.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Export Action Card */}
        <View style={styles.exportCard}>
          <View style={styles.exportLeft}>
            <FileText size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.exportTitle}>Export Audit Log</Text>
              <Text style={styles.exportSub}>
                Generate formal report for Dean & Proctor
              </Text>
            </View>
          </View>

          <View style={styles.exportButtonsRow}>
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() => handleExportTrigger('PDF')}
              activeOpacity={0.7}
            >
              <Download size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.exportBtnText}>PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: COLORS.success }]}
              onPress={() => handleExportTrigger('CSV')}
              activeOpacity={0.7}
            >
              <FileSpreadsheet size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.exportBtnText}>CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content based on selected report */}
        {reportType === 'daily' && (
          <View>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Today's Movement Summary</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{stats.presentInHostel}</Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: COLORS.warning }]}>
                    {stats.currentlyOutside}
                  </Text>
                  <Text style={styles.statLabel}>Outside</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: COLORS.primary }]}>
                    {stats.expectedReturnsToday}
                  </Text>
                  <Text style={styles.statLabel}>Expected Back</Text>
                </View>
              </View>
            </View>

            <MiniBarChart title="Daily Gate Activity Breakdown" />
          </View>
        )}

        {reportType === 'monthly' && (
          <View>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>November 2026 Monthly Metrics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>124</Text>
                  <Text style={styles.statLabel}>Total Leaves</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: COLORS.success }]}>96%</Text>
                  <Text style={styles.statLabel}>On-Time Return</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: COLORS.danger }]}>4%</Text>
                  <Text style={styles.statLabel}>Late Returns</Text>
                </View>
              </View>
            </View>

            <MiniBarChart
              title="Leaves by Department (Monthly)"
              data={[
                { label: 'CSE', value: 38 },
                { label: 'IT', value: 24 },
                { label: 'ECE', value: 19 },
                { label: 'MECH', value: 16 },
                { label: 'CIVIL', value: 12 },
                { label: 'EE', value: 15 },
              ]}
            />
          </View>
        )}

        {reportType === 'overdue' && (
          <View>
            <Text style={styles.overdueSectionTitle}>Students Exceeding Leave Return</Text>

            {overdueList.length > 0 ? (
              overdueList.map((req) => (
                <View key={req.id} style={styles.overdueCard}>
                  <View style={styles.overdueCardHeader}>
                    <Text style={styles.overdueStudentName}>{req.studentName}</Text>
                    <View style={styles.overdueBadge}>
                      <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                    </View>
                  </View>

                  <Text style={styles.overdueDetail}>
                    Roll: {req.enrollmentNo} • Room {req.roomNo}
                  </Text>
                  <Text style={styles.overdueExpected}>
                    Expected Return was: {req.expectedReturnDate}
                  </Text>
                  <Text style={styles.overduePhone}>
                    Emergency Phone: {req.emergencyContact}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <CheckCircle2 size={32} color={COLORS.success} />
                <Text style={styles.emptyTitle}>Zero Overdue Students</Text>
                <Text style={styles.emptySub}>
                  All students currently outside have valid upcoming return schedules.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Mock Export Preview Modal */}
      <Modal
        visible={exportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.exportSuccessIcon}>
              <CheckCircle2 size={38} color={COLORS.success} />
            </View>
            <Text style={styles.modalTitle}>
              {exportFormat} Export Generated (Demo)
            </Text>
            <Text style={styles.modalSub}>
              "HostelEase_{reportType.toUpperCase()}_REPORT_2026.{exportFormat.toLowerCase()}" is prepared with complete digital signatures & time-stamps.
            </Text>

            <PrimaryButton
              title="Close Preview"
              onPress={() => setExportModalVisible(false)}
              style={{ width: '100%', height: 44 }}
            />
          </View>
        </View>
      </Modal>

      <RoleTabBar role="warden" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  selectorRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 8,
  },
  selectorPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  selectorPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  selectorTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  exportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  exportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  exportSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  exportButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  overdueSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
    marginBottom: 10,
  },
  overdueCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.danger + '40',
    marginBottom: 10,
  },
  overdueCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  overdueStudentName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  overdueBadge: {
    backgroundColor: COLORS.dangerSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.danger,
  },
  overdueDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  overdueExpected: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
    marginTop: 4,
  },
  overduePhone: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  exportSuccessIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.successSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});
