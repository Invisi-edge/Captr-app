import { useRouter } from 'expo-router';
import { ScanLine, Sparkles, ArrowRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const colors = {
    bg: isDark ? '#0c0f1a' : '#f5f7fa',
    cardBg: isDark ? '#161b2e' : '#ffffff',
    cardBorder: isDark ? '#1e2642' : '#e8ecf4',
    text: isDark ? '#eef0f6' : '#0f172a',
    textSub: isDark ? '#7c8db5' : '#64748b',
    accent: '#6366f1',
    accentSoft: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo / Branding */}
        <View className="items-center mb-12">
          <View
            style={{
              backgroundColor: colors.accentSoft,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 32,
            }}
            className="h-28 w-28 items-center justify-center rounded-[32px] mb-6"
          >
            <ScanLine size={48} color={colors.accent} />
          </View>

          <View className="flex-row items-center mb-3" style={{ gap: 6 }}>
            <Sparkles size={14} color={colors.accent} />
            <Text
              style={{ color: colors.accent }}
              className="text-xs font-bold tracking-widest uppercase"
            >
              Captr
            </Text>
          </View>

          <Text
            style={{ color: colors.text }}
            className="text-[28px] font-bold text-center tracking-tight"
          >
            Business Card{'\n'}Scanner
          </Text>
          <Text
            style={{ color: colors.textSub }}
            className="mt-3 text-[14px] text-center leading-5"
          >
            Capture, organize, and export your{'\n'}contacts with AI-powered OCR.
          </Text>
        </View>

        {/* Feature pills */}
        <View className="flex-row flex-wrap justify-center mb-12" style={{ gap: 8 }}>
          {['AI-Powered OCR', 'Cloud Sync', 'Export to Excel'].map((feature) => (
            <View
              key={feature}
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                borderWidth: 1,
              }}
              className="rounded-full px-4 py-2"
            >
              <Text style={{ color: colors.textSub }} className="text-[11px] font-medium">
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <View className="w-full" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/auth/signin')}
            activeOpacity={0.85}
            className="w-full flex-row items-center justify-center rounded-2xl px-6"
            style={{
              paddingVertical: 18,
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
              gap: 8,
            }}
          >
            <Text className="text-[15px] font-semibold text-white">Sign In</Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/signup')}
            activeOpacity={0.7}
            className="w-full flex-row items-center justify-center rounded-2xl px-6"
            style={{
              paddingVertical: 18,
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              gap: 8,
            }}
          >
            <Text style={{ color: colors.text }} className="text-[15px] font-semibold">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
