import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import {
  FileText,
  UserCheck,
  ShieldCheck,
  LogOut,
  LogIn,
  XCircle,
} from 'lucide-react-native';
import { LEAVE_STATUS } from '../../constants/config';

export default function ActivityTimeline({ request }) {
  if (!request) return null;

  const isRejectedByParent = request.status === LEAVE_STATUS.PARENT_REJECTED;
  const isRejectedByWarden = request.status === LEAVE_STATUS.REJECTED;
  const isExtensionPending = request.status === LEAVE_STATUS.EXTENSION_PENDING;

  const steps = [
    {
      title: 'Request Submitted',
      description: `Submitted by ${request.studentName} for "${request.reason}"`,
      time: request.submittedAt,
      completed: true,
      active: request.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL,
      icon: FileText,
    },
    {
      title: isRejectedByParent ? 'Parent Rejected' : 'Parent Approval',
      description: isRejectedByParent
        ? `Rejected: "${request.rejectionReason || 'No reason provided'}"`
        : request.parentActionAt
        ? `Approved by parent (${request.parentActionComment || 'Permission granted'})`
        : 'Awaiting parent review & approval',
      time: request.parentActionAt,
      completed: !!request.parentActionAt && !isRejectedByParent,
      active: request.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL,
      failed: isRejectedByParent,
      icon: isRejectedByParent ? XCircle : UserCheck,
    },
    {
      title: isRejectedByWarden ? 'Warden Clearance Declined' : 'Warden Gate Clearance',
      description: isRejectedByWarden
        ? `Declined by Warden: "${request.rejectionReason}"`
        : request.wardenActionAt
        ? `Authorized by Warden (${request.wardenActionComment || 'Clearance granted'})`
        : isRejectedByParent
        ? 'Skipped due to parent rejection'
        : 'Pending warden verification',
      time: request.wardenActionAt,
      completed: !!request.wardenActionAt && !isRejectedByWarden,
      active: request.status === LEAVE_STATUS.PARENT_APPROVED,
      failed: isRejectedByWarden,
      disabled: isRejectedByParent,
      icon: isRejectedByWarden ? XCircle : ShieldCheck,
    },
    {
      title: 'Gate Exit (Departure)',
      description: request.actualExitTime
        ? `Checked out through gate. Recorded by ${request.guardExitRecordedBy || 'Gate Security'}`
        : 'Awaiting student arrival at campus gate',
      time: request.actualExitTime,
      completed: !!request.actualExitTime,
      active: request.status === LEAVE_STATUS.WARDEN_APPROVED,
      disabled: isRejectedByParent || isRejectedByWarden,
      icon: LogOut,
    },
    {
      title: 'Hostel Return (Arrival)',
      description: request.actualReturnTime
        ? `Returned safely. Verified by ${request.guardReturnRecordedBy || 'Guard'}`
        : isExtensionPending
        ? 'Extension requested by student. Awaiting return.'
        : `Expected return by ${request.expectedReturnDate}`,
      time: request.actualReturnTime,
      completed: !!request.actualReturnTime,
      active: request.status === LEAVE_STATUS.CHECKED_OUT,
      disabled: isRejectedByParent || isRejectedByWarden,
      icon: LogIn,
    },
  ];

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const IconComponent = step.icon;

        let nodeGradient = ['rgba(241, 245, 249, 0.9)', 'rgba(226, 232, 240, 0.8)'];
        let iconColor = COLORS.textMuted;
        let shadowColor = 'transparent';

        if (step.completed) {
          nodeGradient = COLORS.gradients.liquidSuccess;
          iconColor = '#FFFFFF';
          shadowColor = COLORS.success;
        } else if (step.failed) {
          nodeGradient = COLORS.gradients.liquidDanger;
          iconColor = '#FFFFFF';
          shadowColor = COLORS.danger;
        } else if (step.active) {
          nodeGradient = COLORS.gradients.liquidBlue;
          iconColor = '#FFFFFF';
          shadowColor = COLORS.primary;
        }

        return (
          <View key={index} style={styles.stepRow}>
            {/* Left timeline bar and glowing liquid node */}
            <View style={styles.nodeColumn}>
              <View style={[styles.nodeShadow, { shadowColor }]}>
                <LinearGradient
                  colors={nodeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.node}
                >
                  <View style={styles.nodeGloss} />
                  <IconComponent size={14} color={iconColor} />
                </LinearGradient>
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        step.completed && !step.failed
                          ? 'rgba(16, 185, 129, 0.7)'
                          : 'rgba(203, 213, 225, 0.6)',
                    },
                  ]}
                />
              )}
            </View>

            {/* Right text content */}
            <View style={[styles.contentColumn, isLast && { paddingBottom: 0 }]}>
              <View style={styles.stepHeader}>
                <Text
                  style={[
                    styles.stepTitle,
                    step.failed && { color: COLORS.danger },
                    step.active && { color: COLORS.primary },
                  ]}
                >
                  {step.title}
                </Text>
                {step.time && <Text style={styles.stepTime}>{step.time}</Text>}
              </View>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  stepRow: {
    flexDirection: 'row',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 32,
  },
  nodeShadow: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  node: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  nodeGloss: {
    position: 'absolute',
    top: 0,
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 22,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stepTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  stepDesc: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});
