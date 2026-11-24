import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="apply-leave" />
      <Stack.Screen name="leave-history" />
      <Stack.Screen name="leave-details" />
      <Stack.Screen name="extend-leave" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
