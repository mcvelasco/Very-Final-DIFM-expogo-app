/**
 * app/(app)/_layout.tsx
 * Layout for authenticated screens (home, edit).
 */
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}
