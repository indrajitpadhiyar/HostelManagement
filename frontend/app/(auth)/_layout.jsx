import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { ROLE_HOME_MAP } from '../../components/navigation/RoleRouteGuard';

export default function AuthLayout() {
  const { currentUser, isLoading } = useApp();

  // If already authenticated, redirect to their role home dashboard
  if (!isLoading && currentUser) {
    const targetRoute = ROLE_HOME_MAP[currentUser.role] || '/(auth)/login';
    return <Redirect href={targetRoute} />;
  }

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
