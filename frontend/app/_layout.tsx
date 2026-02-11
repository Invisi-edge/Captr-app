import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ErrorBoundary } from './error-boundary';
import { ContactsProvider } from '@/lib/contacts-context';
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ContactsProvider>
          <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
            </Stack>
          </ThemeProvider>
        </ContactsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
