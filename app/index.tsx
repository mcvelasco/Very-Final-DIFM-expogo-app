/**
 * app/index.tsx
 * Entry point — redirects to login.
 * _layout.tsx will redirect to /(app)/home if already authenticated.
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
