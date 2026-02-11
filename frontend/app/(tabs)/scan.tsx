import { useRouter } from 'expo-router';
import { ScanLine, ImageIcon, Camera, Zap } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanTab() {
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
        {/* Icon with glow effect */}
        <View className="mb-8 items-center">
          <View
            style={{
              backgroundColor: colors.accentSoft,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 24,
            }}
            className="h-24 w-24 items-center justify-center rounded-3xl"
          >
            <ScanLine size={40} color={colors.accent} />
          </View>
        </View>

        <Text
          style={{ color: colors.text }}
          className="mb-2 text-center text-[22px] font-bold tracking-tight"
        >
          Scan Business Card
        </Text>
        <Text
          style={{ color: colors.textSub }}
          className="mb-10 text-center text-[13px] leading-5"
        >
          Capture the front and back of any card.{'\n'}AI will extract contact details automatically.
        </Text>

        {/* Take Photo CTA */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/scanner', params: { mode: 'camera' } })}
          activeOpacity={0.85}
          className="mb-3 w-full flex-row items-center justify-center rounded-2xl px-6"
          style={{
            gap: 10,
            paddingVertical: 18,
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Camera size={20} color="#fff" />
          <Text className="text-[15px] font-semibold text-white">Take Photo</Text>
        </TouchableOpacity>

        {/* Gallery Option */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/scanner', params: { mode: 'gallery' } })}
          activeOpacity={0.7}
          className="w-full flex-row items-center justify-center rounded-2xl px-6"
          style={{
            gap: 10,
            paddingVertical: 18,
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
            borderWidth: 1,
          }}
        >
          <ImageIcon size={20} color={colors.text} />
          <Text
            style={{ color: colors.text }}
            className="text-[15px] font-semibold"
          >
            Choose from Gallery
          </Text>
        </TouchableOpacity>

        {/* Features hint */}
        <View className="mt-10 flex-row items-center" style={{ gap: 6 }}>
          <Zap size={12} color={colors.textSub} />
          <Text style={{ color: colors.textSub }} className="text-[11px]">
            Supports horizontal and vertical card layouts
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
