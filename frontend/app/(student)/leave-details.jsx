import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import { LEAVE_STATUS } from '../../constants/config';
import AppHeader from '../../components/common/AppHeader';
import StatusBadge from '../../components/common/StatusBadge';
import ActivityTimeline from '../../components/cards/ActivityTimeline';
import EmptyState from '../../components/common/EmptyState';
import PrimaryButton from '../../components/common/PrimaryButton';
import {
  Calendar,
  MapPin,
  Phone,
  Clock,
  Shield,
  AlertCircle,
  FileText,
  QrCode,
  ArrowRight,
} from 'lucide-react-native';

export default function StudentLeaveDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { leaveRequests } = useApp();

  const request = leaveRequests.find((r) => r.id === id || r._id === id);

  if (!request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          title="Leave Pass Details"
          subtitle="Not Found"
          showBack={true}
          onBack={() => router.replace('/(student)/leave-history')}
        />
        <View style={{ flex: 1, padding: 20 }}>
          <EmptyState
            title="Leave Pass Not Found"
            description="The requested leave pass could not be found in your history."
          />
        </View>
      </SafeAreaView>
    );
  }

  const canExtend =
    request.status === LEAVE_STATUS.CHECKED_OUT ||
    request.status === LEAVE_STATUS.WARDEN_APPROVED;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Leave Pass Details"
        subtitle={request.id}
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pass Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.passId}>{request.id}</Text>
              <Text style={styles.reasonTitle}>{request.reason}</Text>
            </View>
            <StatusBadge status={request.status} />
          </View>

          {/* Departure -> Return Banner */}
          <View style={styles.scheduleBox}>
            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>DEPARTURE</Text>
              <Text style={styles.scheduleDate}>{request.departureDate}</Text>
              {request.actualExitTime && (
                <Text style={styles.scheduleActual}>Exit: {request.actualExitTime}</Text>
              )}
            </View>

            <ArrowRight size={20} color={COLORS.primary} style={{ marginHorizontal: 10 }} />

            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>EXPECTED RETURN</Text>
              <Text style={[styles.scheduleDate, { color: COLORS.primaryDark }]}>
                {request.expectedReturnDate}
              </Text>
              {request.actualReturnTime && (
                <Text style={styles.scheduleActual}>Returned: {request.actualReturnTime}</Text>
              )}
            </View>
          </View>

          {/* Quick Details List */}
          <View style={styles.detailRow}>
            <MapPin size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.detailText}>
              {request.destinationAddress}, {request.destinationCity}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Phone size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.detailText}>
              Emergency Contact: {request.emergencyContact}
            </Text>
          </View>

          {request.rejectionReason && (
            <View style={styles.rejectionNotice}>
              <AlertCircle size={16} color={COLORS.danger} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rejectionTitle}>Reason for Rejection:</Text>
                <Text style={styles.rejectionText}>{request.rejectionReason}</Text>
              </View>
            </View>
          )}

          {/* Extend button if active */}
          {canExtend && (
            <PrimaryButton
              title="Request Leave Extension"
              onPress={() =>
                router.push({
                  pathname: '/(student)/extend-leave',
                  params: { id: request.id },
                })
              }
              style={{ marginTop: 14 }}
            />
          )}
        </View>

        {/* Extension History Card (if any extensions exist) */}
        {request.extensionHistory && request.extensionHistory.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Extension Requests</Text>
            {request.extensionHistory.map((ext, idx) => (
              <View key={idx} style={styles.extItem}>
                <View style={styles.extHeader}>
                  <Text style={styles.extDates}>
                    {ext.oldReturnDate} ➔ {ext.newReturnDate}
                  </Text>
                  <StatusBadge status={ext.status} size="small" />
                </View>
                <Text style={styles.extReason}>Reason: {ext.reason}</Text>
                <Text style={styles.extTime}>Requested at: {ext.requestedAt}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 5-Step Digital Pass Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pass Progression Timeline</Text>
          <ActivityTimeline request={request} />
        </View>
      </ScrollView>
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
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  passId: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  reasonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  scheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primarySubtle,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  scheduleCol: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  scheduleDate: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  scheduleActual: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  rejectionNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.dangerSubtle,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  rejectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  rejectionText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  extItem: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  extHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  extDates: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  extReason: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  extTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
