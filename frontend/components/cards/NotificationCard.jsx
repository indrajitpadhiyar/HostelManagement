import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { CheckCircle2, AlertCircle, XCircle, Info, ChevronRight } from 'lucide-react-native';

export default function NotificationCard({
  notification,
  onPress,
  style,
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'action':
        return <AlertCircle size={18} color={COLORS.warningDark} />;
      case 'success':
        return <CheckCircle2 size={18} color={COLORS.successDark} />;
      case 'error':
        return <XCircle size={18} color={COLORS.danger} />;
      case 'info':
      default:
        return <Info size={18} color={COLORS.primary} />;
    }
  };

  const getIconBg = () => {
    switch (notification.type) {
      case 'action':
        return COLORS.warningSubtle;
      case 'success':
        return COLORS.successSubtle;
      case 'error':
        return COLORS.dangerSubtle;
      case 'info':
      default:
        return COLORS.primarySubtle;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.outerCard, style]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <LinearGradient
        colors={
          !notification.read
            ? ['rgba(255, 255, 255, 0.98)', 'rgba(238, 246, 255, 0.9)']
            : ['rgba(255, 255, 255, 0.88)', 'rgba(245, 248, 255, 0.78)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.innerCard}
      >
        <View style={styles.topGloss} />

        <View style={[styles.iconWrapper, { backgroundColor: getIconBg() }]}>
          {getIcon()}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, !notification.read && styles.unreadTitle]} numberOfLines={1}>
              {notification.title}
            </Text>
            {!notification.read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>

          <Text style={styles.time}>{notification.timestamp}</Text>
        </View>

        {notification.requestId && (
          <ChevronRight size={16} color={COLORS.textMuted} style={styles.chevron} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  innerCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  message: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  time: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
    alignSelf: 'center',
  },
});
