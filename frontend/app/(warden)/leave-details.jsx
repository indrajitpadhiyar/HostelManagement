import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
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
import SecondaryButton from '../../components/common/SecondaryButton';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import SuccessModal from '../../components/modals/SuccessModal';
import {
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react-native';

export default function WardenLeaveDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { leaveRequests, wardenApproveLeave, wardenRejectLeave } = useApp();

  const request = leaveRequests.find((r) => r.id === id || r._id === id);

  const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          title="Gate Clearance Pass"
          subtitle="Not Found"
          showBack={true}
          onBack={() => router.replace('/(warden)/leave-requests')}
        />
        <View style={{ flex: 1, padding: 20 }}>
          <EmptyState
            title="Leave Request Not Found"
            description="The requested clearance application does not exist in the database."
          />
        </View>
      </SafeAreaView>
    );
  }

  // IMPORTANT RULE: Warden can approve or reject ONLY parent-approved requests!
  const canWardenDecide = request.status === LEAVE_STATUS.PARENT_APPROVED;

  const handleConfirmAction = (reason) => {
    if (modalAction === 'approve') {
      wardenApproveLeave(request.id, 'Official institutional gate clearance approved.');
      setSuccessMsg(`Gate pass issued for ${request.studentName}. Guard notified.`);
    } else {
      wardenRejectLeave(request.id, reason);
      setSuccessMsg(`Gate clearance rejected. Student notified.`);
    }
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Gate Clearance Pass"
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
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>
                {request.studentName} ({request.enrollmentNo})
              </Text>
              <Text style={styles.roomSub}>
                Room {request.roomNo} • {request.department}
              </Text>
            </View>
            <StatusBadge status={request.status} />
          </View>

          <Text style={styles.reasonText}>{request.reason}</Text>

          {/* Schedule */}
          <View style={styles.scheduleBox}>
            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>DEPARTURE</Text>
              <Text style={styles.scheduleDate}>{request.departureDate}</Text>
            </View>

            <ArrowRight size={20} color={COLORS.primary} style={{ marginHorizontal: 10 }} />

            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>EXPECTED RETURN</Text>
              <Text style={[styles.scheduleDate, { color: COLORS.primaryDark }]}>
                {request.expectedReturnDate}
              </Text>
            </View>
          </View>

          {/* Destination & Contacts */}
          <View style={styles.detailRow}>
            <MapPin size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.detailText}>
              {request.destinationAddress}, {request.destinationCity}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Phone size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.detailText}>
              Emergency Phone: {request.emergencyContact}
            </Text>
          </View>

          {/* Parent Approval Verification Status */}
          <View
            style={[
              styles.parentStatusBox,
              request.parentActionAt
                ? { backgroundColor: '#DCFCE7' }
                : { backgroundColor: '#FEF3C7' },
            ]}
          >
            <UserCheck
              size={18}
              color={request.parentActionAt ? '#15803D' : '#B45309'}
              style={{ marginRight: 8 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.parentStatusTitle,
                  { color: request.parentActionAt ? '#15803D' : '#B45309' },
                ]}
              >
                {request.parentActionAt
                  ? 'Parent Approval Verified'
                  : 'Pending Parent Approval'}
              </Text>
              <Text style={styles.parentStatusSub}>
                {request.parentActionComment ||
                  (request.parentActionAt ? 'Authorized by parent.' : 'Warden cannot bypass parent consent.')}
              </Text>
            </View>
          </View>

          {request.rejectionReason && (
            <View style={styles.rejectionNotice}>
              <AlertCircle size={16} color={COLORS.danger} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
                <Text style={styles.rejectionText}>{request.rejectionReason}</Text>
              </View>
            </View>
          )}

          {/* Warden Decision Action Buttons (Active only if parent approved) */}
          {canWardenDecide ? (
            <View style={styles.actionsRow}>
              <SecondaryButton
                title="Decline Clearance"
                onPress={() => {
                  setModalAction('reject');
                  setShowConfirmModal(true);
                }}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Grant Gate Pass"
                onPress={() => {
                  setModalAction('approve');
                  setShowConfirmModal(true);
                }}
                style={{ flex: 1.5 }}
              />
            </View>
          ) : request.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL ? (
            <View style={styles.lockedNotice}>
              <Text style={styles.lockedText}>
                ⚠️ Clearance is locked until parent approves this leave application.
              </Text>
            </View>
          ) : null}
        </View>

        {/* Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Application Timeline</Text>
          <ActivityTimeline request={request} />
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title={modalAction === 'reject' ? 'Decline Gate Pass' : 'Authorize Gate Clearance'}
        message={
          modalAction === 'reject'
            ? 'Provide a valid administrative reason why this gate pass is being declined.'
            : `Grant final clearance for ${request.studentName}? Guard terminal will show student eligible for checkout.`
        }
        confirmText={modalAction === 'reject' ? 'Decline Pass' : 'Issue Gate Pass'}
        confirmVariant={modalAction === 'reject' ? 'danger' : 'primary'}
        requireReason={modalAction === 'reject'}
        reasonPlaceholder="e.g. Disciplinary hold / Unsatisfactory attendance"
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/(warden)/leave-requests');
        }}
        title="Action Completed!"
        message={successMsg}
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
    marginBottom: 12,
  },
  studentName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roomSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  reasonText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 14,
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
  parentStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  parentStatusTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  parentStatusSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
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
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 14,
  },
  lockedNotice: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockedText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
});
