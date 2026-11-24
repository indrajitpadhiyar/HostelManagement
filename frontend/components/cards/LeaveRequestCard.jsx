import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import StatusBadge from '../common/StatusBadge';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react-native';

export default function LeaveRequestCard({
  request,
  onPress,
  showActions = false,
  onApprove,
  onReject,
  approveText = 'Approve',
  rejectText = 'Reject',
  style,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${parseInt(parts[2], 10)} ${months[monthIdx]}`;
    }
    return dateStr;
  };

  return (
    <TouchableOpacity
      style={[styles.outerCard, style]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.94)', 'rgba(240, 246, 255, 0.84)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.innerCard}
      >
        <View style={styles.topGloss} />

        <View style={styles.topRow}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName} numberOfLines={1}>
              {request.studentName}
            </Text>
            <Text style={styles.studentSub}>
              {request.enrollmentNo} • Room {request.roomNo}
            </Text>
          </View>
          <StatusBadge status={request.status} size="small" />
        </View>

        <Text style={styles.reason} numberOfLines={2}>
          {request.reason}
        </Text>

        {/* Liquid Gradient Schedule Banner */}
        <LinearGradient
          colors={['rgba(239, 246, 255, 0.9)', 'rgba(224, 238, 255, 0.75)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.detailsContainer}
        >
          <View style={styles.detailRow}>
            <Calendar size={13} color={COLORS.primary} style={styles.detailIcon} />
            <Text style={styles.detailText}>
              {formatDate(request.departureDate)}
            </Text>
            <ArrowRight size={11} color={COLORS.primaryLight} style={{ marginHorizontal: 4 }} />
            <Text style={styles.detailText}>
              {formatDate(request.expectedReturnDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MapPin size={13} color={COLORS.primary} style={styles.detailIcon} />
            <Text style={styles.detailText} numberOfLines={1}>
              {request.destinationCity || request.destinationAddress}
            </Text>
          </View>
        </LinearGradient>

        {request.submittedAt && (
          <View style={styles.submittedRow}>
            <Clock size={11} color={COLORS.textMuted} style={{ marginRight: 4 }} />
            <Text style={styles.submittedText}>
              Submitted: {request.submittedAt}
            </Text>
          </View>
        )}

        {showActions && (
          <View style={styles.actionsRow}>
            {onReject && (
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectBtn]}
                onPress={() => onReject(request)}
                activeOpacity={0.7}
              >
                <Text style={styles.rejectBtnText}>{rejectText}</Text>
              </TouchableOpacity>
            )}
            {onApprove && (
              <TouchableOpacity
                style={styles.approveTouchable}
                onPress={() => onApprove(request)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={COLORS.gradients.liquidBlue}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.approveBtnGradient}
                >
                  <View style={styles.approveBtnGloss} />
                  <Text style={styles.approveBtnText}>{approveText}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  innerCard: {
    padding: 16,
    position: 'relative',
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  studentInfo: {
    flex: 1,
    marginRight: 8,
  },
  studentName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  studentSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  reason: {
    fontSize: 13.5,
    color: COLORS.textPrimary,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 10,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    marginRight: 5,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  submittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submittedText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorderTint,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: 'rgba(254, 226, 226, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  rejectBtnText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  approveTouchable: {
    flex: 1.3,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  approveBtnGradient: {
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  approveBtnGloss: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
