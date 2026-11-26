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
  Shield,
} from 'lucide-react-native';

export default function ParentLeaveDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { leaveRequests, parentApproveLeave, parentRejectLeave } = useApp();

  const request = leaveRequests.find((r) => r.id === id || r._id === id);

  const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          title="Leave Pass Details"
          subtitle="Not Found"
          showBack={true}
          onBack={() => router.replace('/(parent)/approvals')}
        />
        <View style={{ flex: 1, padding: 20 }}>
          <EmptyState
            title="Leave Application Not Found"
            description="The requested leave pass does not exist or has been removed."
          />
        </View>
      </SafeAreaView>
    );
  }

  const isPendingApproval = request.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL;

  const handleConfirmAction = (reason) => {
    if (modalAction === 'approve') {
      parentApproveLeave(request.id, 'Parent authorization confirmed.');
      setSuccessMsg('Leave request approved! Forwarded to Warden and Guard.');
    } else {
      parentRejectLeave(request.id, reason);
      setSuccessMsg('Leave request rejected. Your reason was recorded.');
    }
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

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
            </View>

            <ArrowRight size={20} color={COLORS.primary} style={{ marginHorizontal: 10 }} />

            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>EXPECTED RETURN</Text>
              <Text style={[styles.scheduleDate, { color: COLORS.primaryDark }]}>
                {request.expectedReturnDate}
              </Text>
            </View>
          </View>

          {/* Details */}
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

          {request.detailedExplanation ? (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>Student Explanation:</Text>
              <Text style={styles.explanationText}>{request.detailedExplanation}</Text>
            </View>
          ) : null}

          {request.rejectionReason && (
            <View style={styles.rejectionNotice}>
              <AlertCircle size={16} color={COLORS.danger} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rejectionTitle}>Parent Rejection Reason:</Text>
                <Text style={styles.rejectionText}>{request.rejectionReason}</Text>
              </View>
            </View>
          )}

          {/* Parent Action Buttons if Pending */}
          {isPendingApproval && (
            <View style={styles.actionsRow}>
              <SecondaryButton
                title="Reject"
                onPress={() => {
                  setModalAction('reject');
                  setShowConfirmModal(true);
                }}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Approve Leave"
                onPress={() => {
                  setModalAction('approve');
                  setShowConfirmModal(true);
                }}
                style={{ flex: 1.5 }}
              />
            </View>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Digital Pass Lifecycle</Text>
          <ActivityTimeline request={request} />
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title={modalAction === 'reject' ? 'Reject Leave Application' : 'Approve Leave Application'}
        message={
          modalAction === 'reject'
            ? 'Please enter the reason why this leave is being rejected.'
            : 'Are you sure you want to approve this leave pass? It will proceed to Warden clearance.'
        }
        confirmText={modalAction === 'reject' ? 'Confirm Rejection' : 'Approve'}
        confirmVariant={modalAction === 'reject' ? 'danger' : 'primary'}
        requireReason={modalAction === 'reject'}
        reasonPlaceholder="Enter reason for rejection..."
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/(parent)/approvals');
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
  explanationBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    marginBottom: 10,
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  explanationText: {
    fontSize: 12.5,
    color: COLORS.textPrimary,
    marginTop: 2,
    lineHeight: 17,
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
