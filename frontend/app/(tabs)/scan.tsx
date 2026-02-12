import { useRouter } from 'expo-router';
import { ScanLine, ImageIcon, Camera, Zap, Shield } from 'lucide-react-native';
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

export default function ScanTab() {
  const { isDark } = useTheme();
  const router = useRouter();
  const c = premiumColors(isDark);

  // --- Animations ---
  // Rotating ring
  const ringRotation = useSharedValue(0);
  // Pulsing glow opacity
  const glowOpacity = useSharedValue(0.6);
  // Breathing icon scale
  const iconScale = useSharedValue(1);
  // Button press scales
  const takePhotoScale = useSharedValue(1);
  const galleryScale = useSharedValue(1);

  useEffect(() => {
    // Rotating ring: continuous 360° rotation
    ringRotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulsing glow
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Breathing icon
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${ringRotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const iconBreathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const takePhotoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: takePhotoScale.value }],
  }));

  const galleryAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: galleryScale.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['4xl'] }}>

        {/* Layered scan icon with glow */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={{ marginBottom: spacing['4xl'], alignItems: 'center' }}
        >
          {/* Rotating dashed ring */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 148,
                height: 148,
                borderRadius: radius['3xl'] + 10,
                borderWidth: 1.5,
                borderColor: c.accent,
                borderStyle: 'dashed',
                alignSelf: 'center',
                top: -10,
              },
              ringStyle,
            ]}
          />

          {/* Outer glow ring */}
          <Animated.View
            style={[
              {
                width: 128,
                height: 128,
                borderRadius: radius['3xl'],
                backgroundColor: c.accentGlow,
                alignItems: 'center',
                justifyContent: 'center',
                ...c.shadow.glow(c.accent),
              },
              glowStyle,
            ]}
          >
            {/* Inner icon container */}
            <Animated.View
              style={[
                {
                  width: 96,
                  height: 96,
                  borderRadius: radius['2xl'],
                  backgroundColor: c.accentSoft,
                  borderWidth: 1,
                  borderColor: c.glassBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                iconBreathStyle,
              ]}
            >
              <ScanLine size={44} color={c.accent} strokeWidth={1.8} />
            </Animated.View>
          </Animated.View>
          {/* Decorative accent dot */}
          <View
            style={{
              position: 'absolute',
              bottom: 4,
              right: -4,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: c.accentDark,
              ...c.shadow.glow(c.accentDark),
            }}
          />
        </Animated.View>

        {/* Premium heading */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text
            style={{
              color: c.text,
              fontSize: 26,
              fontWeight: '800',
              letterSpacing: -0.6,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            Scan Business Card
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(600)}>
          <Text
            style={{
              color: c.textSecondary,
              fontSize: 14,
              lineHeight: 21,
              textAlign: 'center',
              marginBottom: spacing['4xl'] + spacing.sm,
              paddingHorizontal: spacing.lg,
            }}
          >
            Capture the front and back of any card.{'\n'}AI will extract contact details automatically.
          </Text>
        </Animated.View>

        {/* Take Photo CTA — primary with glow */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={{ width: '100%' }}>
          <Pressable
            onPressIn={() => {
              takePhotoScale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
            }}
            onPressOut={() => {
              takePhotoScale.value = withSpring(1, { damping: 15, stiffness: 300 });
            }}
            onPress={() => router.push({ pathname: '/scanner', params: { mode: 'camera' } })}
          >
            <Animated.View
              style={[
                {
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  paddingVertical: 20,
                  borderRadius: radius.xl,
                  backgroundColor: c.accentDark,
                  ...c.shadow.glow(c.accentDark),
                },
                takePhotoAnimStyle,
              ]}
            >
              <Camera size={20} color="#fff" strokeWidth={2} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', letterSpacing: 0.1 }}>
                Take Photo
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Gallery Option — card with subtle border */}
        <Animated.View entering={FadeInDown.delay(650).duration(600)} style={{ width: '100%' }}>
          <Pressable
            onPressIn={() => {
              galleryScale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
            }}
            onPressOut={() => {
              galleryScale.value = withSpring(1, { damping: 15, stiffness: 300 });
            }}
            onPress={() => router.push({ pathname: '/scanner', params: { mode: 'gallery' } })}
          >
            <Animated.View
              style={[
                {
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  paddingVertical: 20,
                  borderRadius: radius.xl,
                  marginTop: spacing.md,
                  backgroundColor: c.cardBg,
                  borderColor: c.cardBorder,
                  borderWidth: 1,
                  ...c.shadow.sm,
                },
                galleryAnimStyle,
              ]}
            >
              <ImageIcon size={20} color={c.text} strokeWidth={1.8} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>
                Choose from Gallery
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Premium feature hints */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(600)}
          style={{
            marginTop: spacing['4xl'] + spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Zap size={12} color={c.textMuted} strokeWidth={2} />
            <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '500' }}>
              AI-powered OCR
            </Text>
          </View>
          <View
            style={{
              width: 3,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: c.textMuted,
              opacity: 0.4,
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Shield size={12} color={c.textMuted} strokeWidth={2} />
            <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '500' }}>
              All layouts supported
            </Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
