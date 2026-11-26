import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import { ROLES } from '../../constants/config';

export const ROLE_HOME_MAP = {
  [ROLES.STUDENT]: '/(student)/dashboard',
  [ROLES.PARENT]: '/(parent)/dashboard',
  [ROLES.WARDEN]: '/(warden)/dashboard',
  [ROLES.GUARD]: '/(guard)/dashboard',
};

/**
 * RoleRouteGuard enforces strict Role-Based Access Control (RBAC).
 * - Only users with the matching allowedRole can access child routes.
 * - Unauthenticated visitors are redirected to /(auth)/login.
 * - Authenticated users attempting cross-role access are securely routed back to their own portal.
 */
export default function RoleRouteGuard({ allowedRole, children }) {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  // Account pending warden approval
  if (currentUser.status === 'pending_approval') {
    return <Redirect href="/(auth)/login" />;
  }

  // Authenticated but wrong role -> redirect to their authorized section home
  if (currentUser.role !== allowedRole) {
    const targetRoute = ROLE_HOME_MAP[currentUser.role] || '/(auth)/login';
    return <Redirect href={targetRoute} />;
  }

  return children;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
