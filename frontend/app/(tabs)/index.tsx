import { useAuth } from '@/lib/auth-context';
import { useContacts } from '@/lib/contacts-context';
import { useRouter } from 'expo-router';
import {
  ScanLine,
  Users,
  MessageCircle,
  ChevronRight,
  Sparkles,
  LogOut,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useMemo } from 'react';
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
    gradient1: '#6366f1',
    gradient2: '#8b5cf6',
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  const stats = [
    {
      label: 'Total',
      value: cards.length,
      icon: Users,
      color: '#6366f1',
      bgColor: '#6366f115',
    },
    {
      label: 'Emails',
      value: cards.filter((c) => c.email).length,
      icon: Mail,
      color: '#06b6d4',
      bgColor: '#06b6d415',
    },
    {
      label: 'Phones',
      value: cards.filter((c) => c.phone).length,
      icon: Phone,
      color: '#10b981',
      bgColor: '#10b98115',
    },
    {
      label: 'Companies',
      value: new Set(cards.map(c => c.company).filter(Boolean)).size,
      icon: Building2,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
    },
  ];

  const recentCard = cards[0];
  const hasCards = cards.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-5 pb-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <View
                style={{
                  backgroundColor: colors.accent,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
                className="h-10 w-10 items-center justify-center rounded-xl"
              >
                <Sparkles size={18} color="#fff" />
              </View>
              <View>
                <Text
                  style={{ color: colors.accent }}
                  className="text-[10px] font-bold tracking-widest uppercase"
                >
                  Captr
                </Text>
                <Text style={{ color: colors.textSub }} className="text-[10px]">
                  AI Card Scanner
                </Text>
              </View>
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
              className="rounded-full p-2.5"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }}
            >
              <LogOut size={16} color={colors.textSub} />
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <View className="mt-6">
            <Text style={{ color: colors.textSub }} className="text-[13px]">
              {greeting},
            </Text>
            <Text
              style={{ color: colors.text }}
              className="text-[28px] font-bold tracking-tight"
            >
              {firstName}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mt-5">
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {stats.map((stat, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBorder,
                  borderWidth: 1,
                  width: '47.5%',
                }}
                className="rounded-2xl p-4"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    style={{ backgroundColor: stat.bgColor }}
                    className="h-9 w-9 items-center justify-center rounded-xl"
                  >
                    <stat.icon size={16} color={stat.color} />
                  </View>
                  {i === 0 && hasCards && (
                    <View className="flex-row items-center" style={{ gap: 2 }}>
                      <TrendingUp size={10} color="#10b981" />
                      <Text style={{ color: '#10b981' }} className="text-[9px] font-semibold">
                        Active
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-[24px] font-bold"
                >
                  {stat.value}
                </Text>
                <Text
                  style={{ color: colors.textSub }}
                  className="text-[11px] font-medium"
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Scan CTA - Hero */}
        <View className="px-6 mt-6">
          <TouchableOpacity
            onPress={() => router.push('/scanner')}
            activeOpacity={0.9}
            style={{
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 10,
            }}
            className="rounded-3xl overflow-hidden"
          >
            <View className="px-6 py-6">
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  className="h-14 w-14 items-center justify-center rounded-2xl mr-4"
                >
                  <ScanLine size={26} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-[18px] font-bold text-white">
                    Scan Card
                  </Text>
                  <Text className="text-[12px] text-white/70 mt-1">
                    AI extracts contacts instantly
                  </Text>
                </View>
                <View
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  className="h-10 w-10 items-center justify-center rounded-full"
                >
                  <ChevronRight size={20} color="#fff" />
                </View>
              </View>
            </View>
            {/* Decorative elements */}
            <View
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: -30,
                left: 40,
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
            />
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

          <View className="flex-row" style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/cards')}
              activeOpacity={0.7}
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                borderWidth: 1,
                flex: 1,
              }}
              className="rounded-2xl p-4 items-center"
            >
              <View
                style={{ backgroundColor: '#06b6d415' }}
                className="h-12 w-12 items-center justify-center rounded-2xl mb-3"
              >
                <Users size={20} color="#06b6d4" />
              </View>
              <Text style={{ color: colors.text }} className="text-[12px] font-semibold">
                Contacts
              </Text>
              <Text style={{ color: colors.textSub }} className="text-[10px] mt-0.5">
                {cards.length} saved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/chat')}
              activeOpacity={0.7}
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                borderWidth: 1,
                flex: 1,
              }}
              className="rounded-2xl p-4 items-center"
            >
              <View
                style={{ backgroundColor: '#8b5cf615' }}
                className="h-12 w-12 items-center justify-center rounded-2xl mb-3"
              >
                <MessageCircle size={20} color="#8b5cf6" />
              </View>
              <Text style={{ color: colors.text }} className="text-[12px] font-semibold">
                AI Chat
              </Text>
              <Text style={{ color: colors.textSub }} className="text-[10px] mt-0.5">
                Ask anything
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Contacts */}
        {hasCards && (
          <View className="px-6 mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                style={{ color: colors.textSub }}
                className="text-[11px] font-semibold tracking-widest uppercase"
              >
                Recent Contacts
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/cards')}
                className="flex-row items-center"
                style={{ gap: 4 }}
              >
                <Text style={{ color: colors.accent }} className="text-[11px] font-semibold">
                  See All
                </Text>
                <ChevronRight size={12} color={colors.accent} />
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
              {cards.slice(0, 3).map((card, idx) => {
                const avatarColors = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
                const colorIndex = card.name ? card.name.charCodeAt(0) % avatarColors.length : 0;
                const avatarColor = avatarColors[colorIndex];

                return (
                  <TouchableOpacity
                    key={card.id}
                    onPress={() => router.push(`/card/${card.id}`)}
                    activeOpacity={0.7}
                    className="flex-row items-center px-4 py-3.5"
                    style={{
                      borderBottomWidth: idx < Math.min(cards.length, 3) - 1 ? 1 : 0,
                      borderBottomColor: colors.cardBorder,
                    }}
                  >
                    <View
                      style={{ backgroundColor: `${avatarColor}18` }}
                      className="mr-3 h-11 w-11 items-center justify-center rounded-full"
                    >
                      <Text style={{ color: avatarColor }} className="text-[14px] font-bold">
                        {(card.name || '?')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{ color: colors.text }}
                        className="text-[14px] font-semibold"
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
                    <ChevronRight size={16} color={colors.textSub} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Empty State / Tip */}
        {!hasCards && (
          <View className="px-6 mt-6">
            <View
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                borderWidth: 1,
              }}
              className="rounded-2xl p-5"
            >
              <View className="flex-row items-start" style={{ gap: 12 }}>
                <View
                  style={{ backgroundColor: colors.accentSoft }}
                  className="h-10 w-10 items-center justify-center rounded-xl"
                >
                  <Zap size={18} color={colors.accent} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.text }} className="text-[14px] font-semibold">
                    Get started
                  </Text>
                  <Text style={{ color: colors.textSub }} className="text-[12px] mt-1 leading-5">
                    Scan your first business card to start building your digital network. Our AI will extract all contact details automatically.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Pro Tip */}
        {hasCards && (
          <View className="px-6 mt-5">
            <View
              style={{
                backgroundColor: colors.accentSoft,
                borderColor: colors.accent + '30',
                borderWidth: 1,
              }}
              className="rounded-xl px-4 py-3 flex-row items-center"
            >
              <Clock size={14} color={colors.accent} />
              <Text style={{ color: colors.accent }} className="text-[11px] ml-2 flex-1">
                <Text className="font-semibold">Tip:</Text> Use AI Chat to search contacts by company or role
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
