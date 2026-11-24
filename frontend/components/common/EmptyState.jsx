import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import PrimaryButton from './PrimaryButton';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionTitle,
  onActionPress,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Icon size={32} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onActionPress && (
        <PrimaryButton
          title={actionTitle}
          onPress={onActionPress}
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 18,
    height: 42,
    paddingHorizontal: 20,
  },
});
