import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '../hooks/useApp';
import { COLORS } from '../constants/colors';
import { ROLES } from '../constants/config';

export default function Index() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  switch (currentUser.role) {
    case ROLES.STUDENT:
      return <Redirect href="/(student)/dashboard" />;
    case ROLES.PARENT:
      return <Redirect href="/(parent)/dashboard" />;
    case ROLES.WARDEN:
      return <Redirect href="/(warden)/dashboard" />;
    case ROLES.GUARD:
      return <Redirect href="/(guard)/dashboard" />;
    default:
      return <Redirect href="/(auth)/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
