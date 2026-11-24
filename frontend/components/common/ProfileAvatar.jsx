import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function ProfileAvatar({
  uri,
  name,
  size = 48,
  status = null, // 'online' | 'present' | 'outside'
}) {
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getStatusColor = () => {
    if (status === 'present' || status === 'online') return COLORS.success;
    if (status === 'outside') return COLORS.warning;
    return null;
  };

  const statusColor = getStatusColor();
  const fontSize = size * 0.38;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {statusColor && (
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: statusColor,
              width: Math.max(10, size * 0.24),
              height: Math.max(10, size * 0.24),
              borderRadius: Math.max(5, size * 0.12),
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: COLORS.borderLight,
  },
  fallback: {
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '30',
  },
  initials: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
});
