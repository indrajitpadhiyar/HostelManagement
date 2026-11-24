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
import { LogOut, UserCheck, MapPin, Calendar, Phone, CheckCircle2 } from 'lucide-react-native';

export default function GuardGateExit() {
  const router = useRouter();
  const { selectedId } = useLocalSearchParams();
  const { leaveRequests, students, recordGateExit, currentUser } = useApp();

  // Find all eligible passes ready for exit (parent approved or warden approved)
  const eligibleRequests = leaveRequests.filter(
    (r) =>
      (r.status === LEAVE_STATUS.WARDEN_APPROVED || r.status === LEAVE_STATUS.PARENT_APPROVED) &&
      !r.actualExitTime
  );

  const [activeReqId, setActiveReqId] = useState(() => selectedId || eligibleRequests[0]?.id);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const activeRequest = leaveRequests.find((r) => r.id === activeReqId);
  const activeStudent = students.find((s) => s.id === activeRequest?.studentId);

  const handleConfirmExit = () => {
    if (activeRequest) {
      recordGateExit(activeRequest.id, currentUser?.name || 'Balwant Singh');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Gate Exit Clearance"
        subtitle="Record Student Campus Departure"
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Horizontal Selector of Eligible Students */}
        <Text style={styles.sectionHeading}>SELECT STUDENT WAITING AT GATE</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {eligibleRequests.map((req) => {
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
                  {req.enrollmentNo} • {req.roomNo}
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
                status="present"
              />
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{activeStudent.name}</Text>
                <Text style={styles.studentRoll}>
                  {activeStudent.enrollmentNo} • {activeStudent.deptCode}
                </Text>
                <Text style={styles.studentRoom}>
                  Room {activeStudent.roomNo} ({activeStudent.block})
                </Text>
              </View>
            </View>

            {/* Parent Authorization Verification Box */}
            <View style={styles.verifyBox}>
              <UserCheck size={18} color="#15803D" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.verifyTitle}>Parent Approval Confirmed</Text>
                <Text style={styles.verifySub}>
                  Authorized by {activeStudent.parentName} ({activeStudent.parentMobile})
                </Text>
              </View>
            </View>

            {/* Pass Metadata */}
            <View style={styles.metaBox}>
              <Text style={styles.metaReason}>Purpose: {activeRequest.reason}</Text>

              <View style={styles.metaRow}>
                <Calendar size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                <Text style={styles.metaText}>
                  Valid Exit: {activeRequest.departureDate} (Return: {activeRequest.expectedReturnDate})
                </Text>
              </View>

              <View style={styles.metaRow}>
                <MapPin size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {activeRequest.destinationAddress}, {activeRequest.destinationCity}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Phone size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                <Text style={styles.metaText}>
                  Emergency Contact: {activeRequest.emergencyContact}
                </Text>
              </View>
            </View>

            {/* Clear Exit Button */}
            <PrimaryButton
              title="Confirm Identity & Record Gate Exit"
              icon={LogOut}
              onPress={() => setShowConfirmModal(true)}
              style={styles.exitBtn}
            />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No students eligible for exit clearance right now.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmExit}
        title="Authorize Gate Departure?"
        message={`Confirm student ${activeStudent?.name} (${activeStudent?.enrollmentNo}) has presented valid identity and is exiting Main Gate now? This switches status to OUTSIDE_HOSTEL.`}
        confirmText="Authorize & Record Exit"
        confirmVariant="primary"
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/(guard)/dashboard');
        }}
        title="Gate Exit Recorded!"
        message={`Student ${activeStudent?.name} is checked out. Hostel status updated to OUTSIDE_HOSTEL and departure timestamp logged.`}
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
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
  },
  selectorName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectorNameActive: {
    color: COLORS.primary,
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
  verifyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  verifyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  verifySub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  metaBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  metaReason: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  exitBtn: {
    height: 48,
    backgroundColor: '#B45309',
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
