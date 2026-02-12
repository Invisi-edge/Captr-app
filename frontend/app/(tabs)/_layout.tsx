import { premiumColors, radius, spacing } from '@/lib/premium-theme';
import { Tabs } from 'expo-router';
import { Home, ScanLine, Users, MessageCircle, Settings } from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';
import { Platform, View, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { isDark } = useTheme();
  const c = premiumColors(isDark);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 28 : 16,
          left: spacing.xl,
          right: spacing.xl,
          height: 68,
          backgroundColor: c.glassBg,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: c.glassBorder,
          borderRadius: radius['3xl'],
          paddingBottom: 0,
          paddingTop: 0,
          elevation: 0,
          // Premium shadow
          shadowColor: isDark ? '#000' : '#64748b',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.5 : 0.15,
          shadowRadius: 24,
        },
        tabBarItemStyle: {
          paddingTop: 10,
          paddingBottom: 10,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0.6,
          marginTop: 4,
          textTransform: 'uppercase',
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <View style={focused ? [styles.glowWrap, { shadowColor: c.accent }] : undefined}>
                <Home size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
              </View>
              {focused && (
                <View style={[styles.activeIndicator, { backgroundColor: c.accent, shadowColor: c.accent }]} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <View style={focused ? [styles.glowWrap, { shadowColor: c.accent }] : undefined}>
                <ScanLine size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
              </View>
              {focused && (
                <View style={[styles.activeIndicator, { backgroundColor: c.accent, shadowColor: c.accent }]} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <View style={focused ? [styles.glowWrap, { shadowColor: c.accent }] : undefined}>
                <Users size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
              </View>
              {focused && (
                <View style={[styles.activeIndicator, { backgroundColor: c.accent, shadowColor: c.accent }]} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <View style={focused ? [styles.glowWrap, { shadowColor: c.accent }] : undefined}>
                <MessageCircle size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
              </View>
              {focused && (
                <View style={[styles.activeIndicator, { backgroundColor: c.accent, shadowColor: c.accent }]} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <View style={focused ? [styles.glowWrap, { shadowColor: c.accent }] : undefined}>
                <Settings size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
              </View>
              {focused && (
                <View style={[styles.activeIndicator, { backgroundColor: c.accent, shadowColor: c.accent }]} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowWrap: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
});
