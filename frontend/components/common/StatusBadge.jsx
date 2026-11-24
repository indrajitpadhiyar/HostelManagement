import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  LogIn,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react-native';
import { STATUS_CONFIG, HOSTEL_STATUS_CONFIG } from '../../constants/config';
import { COLORS } from '../../constants/colors';

const ICONS = {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  LogIn,
  CalendarCheck,
  ShieldCheck,
};

export default function StatusBadge({
  status,
  isHostelStatus = false,
  size = 'medium', // 'small' | 'medium'
  showIcon = true,
  style,
}) {
  if (isHostelStatus) {
    const config = HOSTEL_STATUS_CONFIG[status] || {
      label: status || 'Unknown',
      bg: 'rgba(241, 245, 249, 0.85)',
      text: '#475569',
      dot: '#94A3B8',
    };

    return (
      <View
        style={[
          styles.badge,
          size === 'small' ? styles.smallBadge : styles.mediumBadge,
          { backgroundColor: config.bg, borderColor: 'rgba(255, 255, 255, 0.8)' },
          style,
        ]}
      >
        <View style={styles.topGloss} />
        <View style={[styles.dot, { backgroundColor: config.dot }]} />
        <Text
          style={[
            styles.text,
            size === 'small' ? styles.smallText : styles.mediumText,
            { color: config.text },
          ]}
        >
          {config.label}
        </Text>
      </View>
    );
  }

  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: 'rgba(241, 245, 249, 0.85)',
    text: '#475569',
    border: 'rgba(226, 232, 240, 0.8)',
    icon: 'Clock',
  };

  const IconComponent = ICONS[config.icon] || Clock;
  const iconSize = size === 'small' ? 11 : 13;

  return (
    <View
      style={[
        styles.badge,
        size === 'small' ? styles.smallBadge : styles.mediumBadge,
        { backgroundColor: config.bg, borderColor: config.border },
        style,
      ]}
    >
      <View style={styles.topGloss} />
      {showIcon && (
        <IconComponent
          size={iconSize}
          color={config.text}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.text,
          size === 'small' ? styles.smallText : styles.mediumText,
          { color: config.text },
        ]}
      >
        {size === 'small' ? config.shortLabel || config.label : config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.2,
    alignSelf: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mediumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  smallText: {
    fontSize: 11,
  },
  mediumText: {
    fontSize: 12.5,
  },
});
