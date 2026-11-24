import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import { LEAVE_STATUS } from '../../constants/config';
import AppHeader from '../../components/common/AppHeader';
import LeaveRequestCard from '../../components/cards/LeaveRequestCard';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import SuccessModal from '../../components/modals/SuccessModal';
import EmptyState from '../../components/common/EmptyState';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import { CheckSquare, Calendar, MapPin, Phone, Clock, ArrowRight } from 'lucide-react-native';

export default function ParentApprovals() {
  const router = useRouter();
  const {
    currentUser,
    students,
    leaveRequests,
    parentApproveLeave,
    parentRejectLeave,
    parentApproveExtension,
    parentRejectExtension,
  } = useApp();

  const child = students.find((s) => s.id === currentUser?.studentId) || students[0];

  // Active tab: 'leaves' | 'extensions'
  const [activeTab, setActiveTab] = useState('leaves');

  // Pending regular leaves
  const pendingLeaves = leaveRequests.filter(
    (r) =>
      r.studentId === child.id &&
      r.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL
  );

  // Pending extensions
  const pendingExtensions = leaveRequests.filter(
    (r) =>
      r.studentId === child.id &&
      r.status === LEAVE_STATUS.EXTENSION_PENDING
  );

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject' | 'approve_ext' | 'reject_ext'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenApprove = (req) => {
    setSelectedRequest(req);
    setModalAction('approve');
    setShowConfirmModal(true);
  };

  const handleOpenReject = (req) => {
    setSelectedRequest(req);
    setModalAction('reject');
    setShowConfirmModal(true);
  };

  const handleOpenApproveExt = (req) => {
    setSelectedRequest(req);
    setModalAction('approve_ext');
    setShowConfirmModal(true);
  };

  const handleOpenRejectExt = (req) => {
    setSelectedRequest(req);
    setModalAction('reject_ext');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = (reason) => {
    if (!selectedRequest) return;

    if (modalAction === 'approve') {
      parentApproveLeave(selectedRequest.id, 'Parent authorization confirmed.');
      setSuccessMsg('Leave request approved! Forwarded to Warden and Guard.');
    } else if (modalAction === 'reject') {
      parentRejectLeave(selectedRequest.id, reason);
      setSuccessMsg('Leave request declined. Reason has been communicated to your child.');
    } else if (modalAction === 'approve_ext') {
      parentApproveExtension(selectedRequest.id);
      setSuccessMsg('Extension approved! New return date updated across campus.');
    } else if (modalAction === 'reject_ext') {
      parentRejectExtension(selectedRequest.id, reason);
      setSuccessMsg('Extension request declined. Original return date preserved.');
    }

    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Leave Approvals"
        subtitle={`Parent Verification for ${child.name}`}
        showBack={true}
        onBack={() => router.back()}
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'leaves' && styles.tabBtnActive]}
          onPress={() => setActiveTab('leaves')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'leaves' && styles.tabBtnTextActive]}>
            Leave Requests ({pendingLeaves.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'extensions' && styles.tabBtnActive]}
          onPress={() => setActiveTab('extensions')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'extensions' && styles.tabBtnTextActive,
            ]}
          >
            Extensions ({pendingExtensions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'leaves' ? (
          pendingLeaves.length > 0 ? (
            pendingLeaves.map((req) => (
              <LeaveRequestCard
                key={req.id}
                request={req}
                showActions={true}
                approveText="Approve Leave"
                rejectText="Reject"
                onApprove={() => handleOpenApprove(req)}
                onReject={() => handleOpenReject(req)}
                onPress={() =>
                  router.push({
                    pathname: '/(parent)/leave-details',
                    params: { id: req.id },
                  })
                }
                style={{ marginBottom: 12 }}
              />
            ))
          ) : (
            <EmptyState
              title="No Pending Leave Requests"
              description={`${child.name} has no pending leave requests awaiting parent approval.`}
            />
          )
        ) : pendingExtensions.length > 0 ? (
          pendingExtensions.map((req) => {
            const ext = req.extensionHistory?.[req.extensionHistory.length - 1];
            return (
              <View key={req.id} style={styles.extCard}>
                <View style={styles.extCardHeader}>
                  <Text style={styles.extCardTitle}>Extension Request: {req.reason}</Text>
                  <Text style={styles.extCardId}>{req.id}</Text>
                </View>

                <View style={styles.extScheduleBox}>
                  <View style={styles.extCol}>
                    <Text style={styles.extColLabel}>PREVIOUS RETURN</Text>
                    <Text style={styles.extColDate}>{ext?.oldReturnDate || req.expectedReturnDate}</Text>
                  </View>
                  <ArrowRight size={18} color={COLORS.primary} />
                  <View style={styles.extCol}>
                    <Text style={styles.extColLabel}>NEW REQUESTED RETURN</Text>
                    <Text style={[styles.extColDate, { color: COLORS.primaryDark }]}>
                      {ext?.newReturnDate || 'TBD'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.extReasonText}>
                  Reason: {ext?.reason || 'No explanation provided.'}
                </Text>

                <View style={styles.extActionsRow}>
                  <TouchableOpacity
                    style={[styles.extActionBtn, styles.extRejectBtn]}
                    onPress={() => handleOpenRejectExt(req)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.extRejectText}>Reject Extension</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.extActionBtn, styles.extApproveBtn]}
                    onPress={() => handleOpenApproveExt(req)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.extApproveText}>Approve Extension</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState
            title="No Pending Extensions"
            description="There are no return date extension requests pending parent review."
          />
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title={
          modalAction?.includes('reject')
            ? 'Reject Leave Application'
            : 'Approve Leave Application'
        }
        message={
          modalAction?.includes('reject')
            ? `Please provide a reason why this request for ${child.name} cannot be approved.`
            : `Confirm parental approval for ${child.name}? This pass will immediately become available in Warden and Security Guard systems.`
        }
        confirmText={modalAction?.includes('reject') ? 'Decline Request' : 'Confirm Approval'}
        confirmVariant={modalAction?.includes('reject') ? 'danger' : 'primary'}
        requireReason={modalAction?.includes('reject')}
        reasonPlaceholder="e.g. Mid-term exams approaching / Family travel plans changed"
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Action Recorded!"
        message={successMsg}
      />

      <RoleTabBar role="parent" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
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
  extCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  extCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  extCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  extCardId: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  extScheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primarySubtle,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  extCol: {
    flex: 1,
  },
  extColLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  extColDate: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  extReasonText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  extActionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
  },
  extActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extRejectBtn: {
    backgroundColor: COLORS.dangerSubtle,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  extRejectText: {
    color: COLORS.danger,
    fontWeight: '600',
    fontSize: 12.5,
  },
  extApproveBtn: {
    backgroundColor: COLORS.primary,
  },
  extApproveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12.5,
  },
});
