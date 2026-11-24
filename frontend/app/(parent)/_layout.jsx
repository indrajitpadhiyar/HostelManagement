import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
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
  );
}
