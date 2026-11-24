import React, { useState } from 'react';
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
import { LEAVE_STATUS, HOSTEL_STATUS } from '../../constants/config';
import AppHeader from '../../components/common/AppHeader';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import StatusBadge from '../../components/common/StatusBadge';
import PrimaryButton from '../../components/common/PrimaryButton';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import SuccessModal from '../../components/modals/SuccessModal';
import { LogIn, Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react-native';

export default function GuardGateReturn() {
  const router = useRouter();
  const { selectedId } = useLocalSearchParams();
  const { leaveRequests, students, recordGateReturn, currentUser } = useApp();

  // Find students currently outside (checked out)
  const outsideRequests = leaveRequests.filter(
    (r) => r.status === LEAVE_STATUS.CHECKED_OUT
  );

  const [activeReqId, setActiveReqId] = useState(() => selectedId || outsideRequests[0]?.id);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const activeRequest = leaveRequests.find((r) => r.id === activeReqId);
  const activeStudent = students.find((s) => s.id === activeRequest?.studentId);

  // Check if late return (overdue)
  const isLate = activeRequest && activeRequest.expectedReturnDate < '2026-11-23';

  const handleConfirmReturn = () => {
    if (activeRequest) {
      recordGateReturn(activeRequest.id, currentUser?.name || 'Balwant Singh');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Gate Return Check-In"
        subtitle="Verify Student Campus Re-entry"
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeading}>SELECT STUDENT ARRIVING AT GATE</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {outsideRequests.map((req) => {
            const isSelected = req.id === activeReqId;
            return (
              <TouchableOpacity
                key={req.id}
                style={[
                  styles.selectorCard,
                  isSelected && styles.selectorCardActive,
                ]}
                onPress={() => setActiveReqId(req.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.selectorName,
                    isSelected && styles.selectorNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {req.studentName}
                </Text>
                <Text style={styles.selectorSub}>
                  Return: {req.expectedReturnDate}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {activeRequest && activeStudent ? (
          <View style={styles.detailCard}>
            <View style={styles.studentHeader}>
              <ProfileAvatar
                uri={activeStudent.avatar}
                name={activeStudent.name}
                size={64}
                status="outside"
              />
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{activeStudent.name}</Text>
                <Text style={styles.studentRoll}>
                  {activeStudent.enrollmentNo} • {activeStudent.deptCode}
                </Text>
                <Text style={styles.studentRoom}>
                  Assigned Room: {activeStudent.roomNo}
                </Text>
              </View>
            </View>

            {/* Late Return Alert Banner if Overdue */}
            {isLate ? (
              <View style={styles.lateBanner}>
                <AlertTriangle size={18} color={COLORS.danger} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.lateTitle}>OVERDUE RETURN WARNING</Text>
                  <Text style={styles.lateSub}>
                    Expected return was {activeRequest.expectedReturnDate}. Late arrival will be flagged in warden records.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.onTimeBanner}>
                <CheckCircle2 size={18} color="#15803D" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.onTimeTitle}>On-Time Return</Text>
                  <Text style={styles.onTimeSub}>
                    Expected return date: {activeRequest.expectedReturnDate}
                  </Text>
                </View>
              </View>
            )}

            {/* Departure Info */}
            <View style={styles.metaBox}>
              <Text style={styles.metaReason}>Purpose: {activeRequest.reason}</Text>
              <Text style={styles.metaText}>
                Departure was recorded at: {activeRequest.actualExitTime || activeRequest.departureDate}
              </Text>
              <Text style={styles.metaText}>
                Destination: {activeRequest.destinationAddress}, {activeRequest.destinationCity}
              </Text>
            </View>

            {/* Return Button */}
            <PrimaryButton
              title="Confirm Re-entry & Record Arrival"
              icon={LogIn}
              variant="success"
              onPress={() => setShowConfirmModal(true)}
              style={styles.returnBtn}
            />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No students are currently marked as outside hostel.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmReturn}
        title="Record Hostel Re-entry?"
        message={`Confirm ${activeStudent?.name} has returned to hostel premises? This updates student status to PRESENT_IN_HOSTEL.`}
        confirmText="Confirm Re-entry"
        confirmVariant="success"
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/(guard)/dashboard');
        }}
        title="Gate Return Recorded!"
        message={`Student ${activeStudent?.name} is successfully checked in. Status updated to PRESENT_IN_HOSTEL and parent notified.`}
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
    padding: 16,
    paddingBottom: 24,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  selectorRow: {
    gap: 10,
    paddingBottom: 12,
  },
  selectorCard: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 140,
  },
  selectorCardActive: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successSubtle,
  },
  selectorName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectorNameActive: {
    color: COLORS.successDark,
  },
  selectorSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 6,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  studentName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  studentRoll: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  studentRoom: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  lateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerSubtle,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  lateTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.danger,
  },
  lateSub: {
    fontSize: 11.5,
    color: COLORS.danger,
    marginTop: 2,
  },
  onTimeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  onTimeTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
  },
  onTimeSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  metaBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 4,
  },
  metaReason: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  returnBtn: {
    height: 48,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
