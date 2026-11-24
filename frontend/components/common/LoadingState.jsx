import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function LoadingState({ message = 'Loading...', style }) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
});
