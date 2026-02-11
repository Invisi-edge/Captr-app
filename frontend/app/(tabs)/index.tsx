import { useAuth } from '@/lib/auth-context';
import { useContacts } from '@/lib/contacts-context';
import { useRouter } from 'expo-router';
import { ScanLine, Users, MessageCircle, Download, ChevronRight, Sparkles, LogOut } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { cards, fetchCards } = useContacts();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) fetchCards();
  }, [user]);

  const colors = {
    bg: isDark ? '#0c0f1a' : '#f5f7fa',
    cardBg: isDark ? '#161b2e' : '#ffffff',
    cardBorder: isDark ? '#1e2642' : '#e8ecf4',
    text: isDark ? '#eef0f6' : '#0f172a',
    textSub: isDark ? '#7c8db5' : '#64748b',
    accent: '#6366f1',
    accentSoft: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
    accentGlow: isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)',
  };

  const stats = [
    { label: 'Total Cards', value: cards.length, color: '#6366f1' },
    { label: 'With Email', value: cards.filter((c) => c.email).length, color: '#06b6d4' },
    { label: 'With Phone', value: cards.filter((c) => c.phone).length, color: '#10b981' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <View
                style={{ backgroundColor: colors.accentSoft }}
                className="h-8 w-8 items-center justify-center rounded-lg"
              >
                <Sparkles size={16} color={colors.accent} />
              </View>
              <Text
                style={{ color: colors.accent }}
                className="text-xs font-bold tracking-widest uppercase"
              >
                Captr
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                      await signOut();
                      router.replace('/welcome');
                    },
                  },
                ]);
              }}
              activeOpacity={0.7}
              className="flex-row items-center rounded-xl px-3 py-2"
              style={{ gap: 5, backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }}
            >
              <LogOut size={13} color={colors.textSub} />
              <Text style={{ color: colors.textSub }} className="text-[11px] font-medium">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{ color: colors.text }}
            className="mt-3 text-[26px] font-bold tracking-tight"
          >
            Business Card{'\n'}Scanner
          </Text>
          <Text
            style={{ color: colors.textSub }}
            className="mt-1.5 text-[13px] leading-5"
          >
            Capture, organize, and export your contacts with AI-powered OCR.
          </Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row px-6 mt-5" style={{ gap: 10 }}>
          {stats.map((stat, i) => (
            <View
              key={i}
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                borderWidth: 1,
                flex: 1,
              }}
              className="rounded-2xl p-3.5"
            >
              <View
                style={{ backgroundColor: `${stat.color}18`, width: 32, height: 32 }}
                className="items-center justify-center rounded-lg mb-2.5"
              >
                <View
                  style={{ backgroundColor: stat.color, width: 8, height: 8 }}
                  className="rounded-full"
                />
              </View>
              <Text
                style={{ color: colors.text }}
                className="text-[22px] font-bold"
              >
                {stat.value}
              </Text>
              <Text
                style={{ color: colors.textSub }}
                className="text-[10px] mt-0.5 font-medium"
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Scan CTA */}
        <View className="px-6 mt-5">
          <TouchableOpacity
            onPress={() => router.push('/scanner')}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
            className="flex-row items-center rounded-2xl px-5 py-4"
          >
            <View
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              className="h-11 w-11 items-center justify-center rounded-xl mr-4"
            >
              <ScanLine size={22} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-white">
                Scan Business Card
              </Text>
              <Text className="text-[11px] text-white/70 mt-0.5">
                Capture front & back with AI
              </Text>
            </View>
            <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-6">
          <Text
            style={{ color: colors.textSub }}
            className="text-[11px] font-semibold tracking-widest uppercase mb-3"
          >
            Quick Actions
          </Text>

          <View style={{ gap: 8 }}>
            <ActionRow
              icon={<Users size={18} color="#06b6d4" />}
              iconBg="#06b6d415"
              title="View All Contacts"
              subtitle={`${cards.length} cards saved`}
              onPress={() => router.push('/(tabs)/cards')}
              colors={colors}
            />
            <ActionRow
              icon={<MessageCircle size={18} color="#8b5cf6" />}
              iconBg="#8b5cf615"
              title="AI Assistant"
              subtitle="Search and analyze contacts"
              onPress={() => router.push('/(tabs)/chat')}
              colors={colors}
            />
            <ActionRow
              icon={<Download size={18} color="#10b981" />}
              iconBg="#10b98115"
              title="Export Data"
              subtitle="Download as Excel or CSV"
              onPress={() => router.push('/(tabs)/cards')}
              colors={colors}
            />
          </View>
        </View>

        {/* Recent Cards */}
        {cards.length > 0 && (
          <View className="px-6 mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                style={{ color: colors.textSub }}
                className="text-[11px] font-semibold tracking-widest uppercase"
              >
                Recent Contacts
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/cards')}>
                <Text style={{ color: colors.accent }} className="text-[11px] font-semibold">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                borderWidth: 1,
              }}
              className="rounded-2xl overflow-hidden"
            >
              {cards.slice(0, 3).map((card, idx) => (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => router.push(`/card/${card.id}`)}
                  className="flex-row items-center px-4 py-3.5"
                  style={{
                    borderBottomWidth: idx < Math.min(cards.length, 3) - 1 ? 1 : 0,
                    borderBottomColor: colors.cardBorder,
                  }}
                >
                  <View
                    style={{ backgroundColor: colors.accentSoft }}
                    className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                  >
                    <Text style={{ color: colors.accent }} className="text-sm font-bold">
                      {(card.name || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ color: colors.text }}
                      className="text-[13px] font-semibold"
                      numberOfLines={1}
                    >
                      {card.name || 'Unknown'}
                    </Text>
                    <Text
                      style={{ color: colors.textSub }}
                      className="text-[11px] mt-0.5"
                      numberOfLines={1}
                    >
                      {card.company || card.job_title || card.email || 'No details'}
                    </Text>
                  </View>
                  <ChevronRight size={14} color={colors.textSub} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionRow({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  colors,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }}
      className="flex-row items-center rounded-2xl px-4 py-3.5"
    >
      <View
        style={{ backgroundColor: iconBg }}
        className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text style={{ color: colors.text }} className="text-[13px] font-semibold">{title}</Text>
        <Text style={{ color: colors.textSub }} className="text-[11px] mt-0.5">{subtitle}</Text>
      </View>
      <ChevronRight size={14} color={colors.textSub} />
    </TouchableOpacity>
  );
}
