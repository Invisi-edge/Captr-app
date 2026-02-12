import { useRouter } from 'expo-router';
import { ScanLine, Sparkles, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';
import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { premiumColors, radius, spacing } from '@/lib/premium-theme';

export default function WelcomeScreen() {
  const { isDark } = useTheme();
  const router = useRouter();

  const colors = premiumColors(isDark);

  // --- Orb animations ---
  // Orb 1 (top-right): float up-down
  const orb1TranslateY = useSharedValue(0);
  // Orb 2 (bottom-left): float side-to-side
  const orb2TranslateX = useSharedValue(0);
  // Orb 3 (mid-left): scale in-out
  const orb3Scale = useSharedValue(1);

  // Breathing icon
  const iconScale = useSharedValue(1);

  // Button press scales
  const signInScale = useSharedValue(1);
  const createAccountScale = useSharedValue(1);

  useEffect(() => {
    // Orb 1: float up-down
    orb1TranslateY.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(18, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Orb 2: float side-to-side
    orb2TranslateX.value = withRepeat(
      withSequence(
        withTiming(14, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-14, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Orb 3: scale in-out
    orb3Scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 2800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Icon breathing
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: orb1TranslateY.value }],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2TranslateX.value }],
  }));

  const orb3Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb3Scale.value }],
  }));

  const iconBreathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const signInAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: signInScale.value }],
  }));

  const createAccountAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: createAccountScale.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Decorative background shapes */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: -80,
            right: -60,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: colors.accentGlow,
          },
          orb1Style,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: -40,
            left: -80,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.06)' : 'rgba(99, 102, 241, 0.04)',
          },
          orb2Style,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: '40%',
            left: -30,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: isDark ? 'rgba(129, 140, 248, 0.04)' : 'rgba(129, 140, 248, 0.03)',
          },
          orb3Style,
        ]}
      />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        {/* Logo / Branding */}
        <View style={{ alignItems: 'center', marginBottom: 56 }}>
          {/* Scan Icon with Layered Glow */}
          <Animated.View
            entering={FadeInDown.duration(600)}
            style={[{ alignItems: 'center', justifyContent: 'center', marginBottom: 32 }, iconBreathStyle]}
          >
            {/* Outer glow ring */}
            <View
              style={{
                position: 'absolute',
                width: 160,
                height: 160,
                borderRadius: 48,
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.06)' : 'rgba(99, 102, 241, 0.04)',
              }}
            />
            {/* Middle glow ring */}
            <View
              style={{
                position: 'absolute',
                width: 136,
                height: 136,
                borderRadius: 40,
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.10)' : 'rgba(99, 102, 241, 0.06)',
              }}
            />
            {/* Main icon container */}
            <View
              style={{
                width: 112,
                height: 112,
                borderRadius: radius['3xl'],
                backgroundColor: colors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.10)',
                ...colors.shadow.glow(colors.accent),
              }}
            >
              <ScanLine size={52} color={colors.accent} />
            </View>
          </Animated.View>

          {/* Brand badge */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(600)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16,
              backgroundColor: colors.accentSoft,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: radius.full,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(129, 140, 248, 0.12)' : 'rgba(99, 102, 241, 0.08)',
            }}
          >
            <Sparkles size={13} color={colors.accent} />
            <Text
              style={{
                color: colors.accent,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              AI-Powered
            </Text>
          </Animated.View>

          {/* Brand Name - Prominent */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <Text
              style={{
                color: colors.accent,
                fontSize: 42,
                fontWeight: '800',
                letterSpacing: -1,
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              Captr
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Text
              style={{
                color: colors.text,
                fontSize: 26,
                fontWeight: '700',
                textAlign: 'center',
                letterSpacing: -0.5,
                lineHeight: 34,
              }}
            >
              Business Card{'\n'}Scanner
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(600)}>
            <Text
              style={{
                color: colors.textSecondary,
                marginTop: 14,
                fontSize: 15,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              Capture, organize, and export your{'\n'}contacts with AI-powered OCR.
            </Text>
          </Animated.View>
        </View>

        {/* Feature pills with glassmorphism */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 56,
            gap: 10,
          }}
        >
          {['AI-Powered OCR', 'Cloud Sync', 'Export to Excel'].map((feature) => (
            <View
              key={feature}
              style={{
                backgroundColor: colors.glassBg,
                borderColor: colors.glassBorder,
                borderWidth: 1,
                borderRadius: radius.full,
                paddingHorizontal: 18,
                paddingVertical: 10,
                ...colors.shadow.sm,
              }}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* CTAs */}
        <Animated.View
          entering={FadeInDown.delay(750).duration(600)}
          style={{ width: '100%', gap: 14 }}
        >
          {/* Sign In button with scale-on-press */}
          <Pressable
            onPressIn={() => {
              signInScale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
            }}
            onPressOut={() => {
              signInScale.value = withSpring(1, { damping: 15, stiffness: 300 });
            }}
            onPress={() => router.push('/auth/signin')}
          >
            <Animated.View
              style={[
                {
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.xl,
                  paddingVertical: 20,
                  backgroundColor: colors.accentDark,
                  gap: 10,
                  ...colors.shadow.glow(colors.accent),
                },
                signInAnimStyle,
              ]}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>
                Sign In
              </Text>
              <ArrowRight size={18} color="#fff" />
            </Animated.View>
          </Pressable>

          {/* Create Account button with scale-on-press */}
          <Pressable
            onPressIn={() => {
              createAccountScale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
            }}
            onPressOut={() => {
              createAccountScale.value = withSpring(1, { damping: 15, stiffness: 300 });
            }}
            onPress={() => router.push('/auth/signup')}
          >
            <Animated.View
              style={[
                {
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.xl,
                  paddingVertical: 20,
                  backgroundColor: colors.glassBg,
                  borderColor: colors.glassBorder,
                  borderWidth: 1,
                  gap: 8,
                  ...colors.shadow.sm,
                },
                createAccountAnimStyle,
              ]}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                Create Account
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
