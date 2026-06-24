/**
 * app/_layout.tsx
 * Root layout — handles auth redirect AND email confirmation deep links.
 *
 * When a user taps the confirmation link in their email, Supabase redirects
 * to your app via deep link (doitforme://) with #access_token=...&type=signup
 * in the URL. We intercept that here and exchange it for a live session.
 */

import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    secondary: '#3B82F6',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    onPrimary: '#FFFFFF',
  },
};

/** Parse the token fragment Supabase appends to the deep-link URL */
function extractTokensFromUrl(url: string) {
  // Supabase puts tokens after # e.g. doitforme://#access_token=xxx&refresh_token=yyy&type=signup
  const fragment = url.split('#')[1];
  if (!fragment) return null;

  const params: Record<string, string> = {};
  fragment.split('&').forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key && value) params[key] = decodeURIComponent(value);
  });

  if (params.access_token && params.refresh_token) return params;
  return null;
}

async function handleDeepLink(url: string) {
  const tokens = extractTokensFromUrl(url);
  if (!tokens) return;

  // Exchange the tokens for a Supabase session
  const { error } = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  if (!error) {
    // Session is now live — useAuth will pick it up and redirect to home
    router.replace('/(app)/home');
  }
}

export default function RootLayout() {
  const { user, loading } = useAuth();

  // Handle deep links while app is already open
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    return () => subscription.remove();
  }, []);

  // Handle deep link that launched the app (app was closed when link was tapped)
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });
  }, []);

  // Auth-aware redirect
  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/(app)/home');
    } else {
      router.replace('/(auth)/login');
    }
  }, [user, loading]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider theme={theme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="index" />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });