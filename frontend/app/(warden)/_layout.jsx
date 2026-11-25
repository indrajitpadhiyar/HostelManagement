import React from 'react';
import { Stack } from 'expo-router';
import RoleRouteGuard from '../../components/navigation/RoleRouteGuard';
import { ROLES } from '../../constants/config';

export default function WardenLayout() {
  return (
    <RoleRouteGuard allowedRole={ROLES.WARDEN}>
      <Stack
        initialRouteName="dashboard"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="students" />
        <Stack.Screen name="student-details" />
        <Stack.Screen name="leave-requests" />
        <Stack.Screen name="leave-details" />
        <Stack.Screen name="activities" />
        <Stack.Screen name="rooms" />
        <Stack.Screen name="guards" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="attendance" />
      </Stack>
    </RoleRouteGuard>
  );
}
