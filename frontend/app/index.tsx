import { useAuth } from '@/lib/auth-context';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, useColorScheme } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDark ? '#06080f' : '#f8fafc',
        }}
      >
        <ActivityIndicator size="large" color="#818cf8" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}
