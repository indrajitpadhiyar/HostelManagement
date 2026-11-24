import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function SectionHeader({
  title,
  subtitle,
  actionText,
  onActionPress,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionText && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 12,
  },
});
