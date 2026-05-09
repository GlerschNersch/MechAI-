import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f172a' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ai-detail" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
