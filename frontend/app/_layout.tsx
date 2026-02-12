import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './error-boundary';
import { ContactsProvider } from '@/lib/contacts-context';
import { AuthProvider } from '@/lib/auth-context';
import { SubscriptionProvider } from '@/lib/subscription-context';
import { ThemeProvider, useTheme } from '@/lib/theme-context';

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <NavThemeProvider value={NAV_THEME[isDark ? 'dark' : 'light']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="card/[id]"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="scanner"
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="plans"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="billing"
          options={{ headerShown: false, presentation: 'modal' }}
        />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <ContactsProvider>
              <RootLayoutContent />
            </ContactsProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
