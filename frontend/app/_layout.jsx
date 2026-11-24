import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(student)" options={{ headerShown: false }} />
          <Stack.Screen name="(parent)" options={{ headerShown: false }} />
          <Stack.Screen name="(warden)" options={{ headerShown: false }} />
          <Stack.Screen name="(guard)" options={{ headerShown: false }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
