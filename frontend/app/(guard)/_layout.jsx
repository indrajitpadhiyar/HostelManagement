import { Stack } from 'expo-router';

export default function GuardLayout() {
  return (
    <Stack
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="approved-leaves" />
      <Stack.Screen name="verify-student" />
      <Stack.Screen name="gate-exit" />
      <Stack.Screen name="gate-return" />
      <Stack.Screen name="gate-history" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
