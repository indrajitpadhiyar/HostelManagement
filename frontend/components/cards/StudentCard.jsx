import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import ProfileAvatar from '../common/ProfileAvatar';
import StatusBadge from '../common/StatusBadge';
import { ChevronRight, Phone, Home } from 'lucide-react-native';

export default function StudentCard({
  student,
  onPress,
  showActions = false,
  onCall,
  onAllocateRoom,
  style,
}) {
  return (
    <TouchableOpacity
      style={[styles.outerCard, style]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.94)', 'rgba(240, 246, 255, 0.82)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.innerCard}
      >
        <View style={styles.topGloss} />

        <View style={styles.headerRow}>
          <ProfileAvatar
            uri={student.avatar}
            name={student.name}
            size={48}
            status={student.hostelStatus === 'PRESENT_IN_HOSTEL' ? 'present' : 'outside'}
          />
          <View style={styles.mainInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {student.name}
            </Text>
            <Text style={styles.enrollment}>
              {student.enrollmentNo} • {student.deptCode || 'ENG'}
            </Text>
            <View style={styles.tagsRow}>
              <View style={styles.roomTag}>
                <Home size={11} color={COLORS.primary} style={{ marginRight: 3 }} />
                <Text style={styles.roomText}>{student.roomNo}</Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.semester}>{student.semester}</Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <StatusBadge
              status={student.hostelStatus}
              isHostelStatus={true}
              size="small"
            />
            <ChevronRight size={18} color={COLORS.textMuted} style={styles.chevron} />
          </View>
        </View>

        {showActions && (
          <View style={styles.actionsFooter}>
            {onCall && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onCall(student.mobile)}
                activeOpacity={0.7}
              >
                <Phone size={13} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.actionBtnText}>Call Student</Text>
              </TouchableOpacity>
            )}
            {onAllocateRoom && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() => onAllocateRoom(student)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionBtnTextPrimary}>Change Room</Text>
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
    padding: 15,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  enrollment: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(219, 234, 254, 0.7)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  roomText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  dot: {
    marginHorizontal: 5,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  semester: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 46,
  },
  chevron: {
    marginTop: 6,
  },
  actionsFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorderTint,
    marginTop: 12,
    paddingTop: 10,
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: 'rgba(147, 197, 253, 0.6)',
  },
  actionBtnTextPrimary: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
