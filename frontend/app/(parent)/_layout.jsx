import React from 'react';
import { Stack } from 'expo-router';
import RoleRouteGuard from '../../components/navigation/RoleRouteGuard';
import { ROLES } from '../../constants/config';

export default function ParentLayout() {
  return (
    <RoleRouteGuard allowedRole={ROLES.PARENT}>
      <Stack
        initialRouteName="dashboard"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="approvals" />
        <Stack.Screen name="leave-details" />
        <Stack.Screen name="history" />
        <Stack.Screen name="notifications" />
      </Stack>
    </RoleRouteGuard>
  );
}
