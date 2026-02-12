import { useAuth } from '@/lib/auth-context';
import { useContacts } from '@/lib/contacts-context';
import { premiumColors, radius, spacing } from '@/lib/premium-theme';
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
import { useTheme } from '@/lib/theme-context';
import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { cards, fetchCards } = useContacts();
  const { user, signOut } = useAuth();
  const c = premiumColors(isDark);

  useEffect(() => {
    if (user) fetchCards();
  }, [user]);

  // Refresh greeting every minute so it updates across time boundaries
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 5) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }, [now]);

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  const stats = [
    {
      label: 'Total Contacts',
      value: cards.length,
      icon: Users,
      color: c.accent,
      tintBg: c.accentSoft,
    },
    {
      label: 'With Email',
      value: cards.filter((card) => card.email).length,
      icon: Mail,
      color: c.info,
      tintBg: c.infoSoft,
    },
    {
      label: 'With Phone',
      value: cards.filter((card) => card.phone).length,
      icon: Phone,
      color: c.success,
      tintBg: c.successSoft,
    },
    {
      label: 'Companies',
      value: new Set(cards.map((card) => card.company).filter(Boolean)).size,
      icon: Building2,
      color: c.warning,
      tintBg: c.warningSoft,
    },
  ];

  const hasCards = cards.length > 0;

  // Hero button scale-on-press animation
  const heroScale = useSharedValue(1);
  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  // Floating decorative circles
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);

  useEffect(() => {
    float1.value = withRepeat(
      withTiming(10, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    float2.value = withRepeat(
      withTiming(-8, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    float3.value = withRepeat(
      withTiming(6, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const floatStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }],
  }));
  const floatStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }],
  }));
  const floatStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateX: float3.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              {/* Logo mark */}
              <View
                style={[
                  styles.logoMark,
                  {
                    backgroundColor: c.accent,
                    ...c.shadow.glow(c.accent),
                  },
                ]}
              >
                <Sparkles size={20} color="#fff" />
              </View>
              <View>
                <Text
                  style={[
                    styles.brandName,
                    { color: c.accent },
                  ]}
                >
                  CAPTR
                </Text>
                <Text style={[styles.brandTagline, { color: c.textMuted }]}>
                  Business Card Scanner
                </Text>
              </View>
            </View>

            {/* Sign Out */}
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
              style={[
                styles.signOutBtn,
                {
                  backgroundColor: c.cardBg,
                  borderColor: c.cardBorder,
                  ...c.shadow.sm,
                },
              ]}
            >
              <LogOut size={16} color={c.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Greeting ─── */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.greetingSection}>
          <Text style={[styles.greetingLabel, { color: c.textSecondary }]}>
            {greeting},
          </Text>
          <Text style={[styles.greetingName, { color: c.text }]}>
            {firstName}
          </Text>
          {/* Decorative accent line */}
          <View style={[styles.accentLine, { backgroundColor: c.accent }]} />
        </Animated.View>

        {/* ─── Stats Grid ─── */}
        <View style={styles.sectionContainer}>
          <View style={styles.statsGrid}>
            {stats.map((stat, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 100).duration(500)}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: c.cardBg,
                    borderColor: c.cardBorderSubtle,
                    ...c.shadow.sm,
                  },
                ]}
              >
                {/* Tint overlay at the top */}
                <View
                  style={[
                    styles.statTintOverlay,
                    { backgroundColor: stat.tintBg },
                  ]}
                />
                <View style={styles.statCardInner}>
                  <View style={styles.statTopRow}>
                    <View
                      style={[
                        styles.statIconWrap,
                        { backgroundColor: stat.tintBg },
                      ]}
                    >
                      <stat.icon size={16} color={stat.color} strokeWidth={2} />
                    </View>
                    {i === 0 && hasCards && (
                      <View style={[styles.activeBadge, { backgroundColor: c.successSoft }]}>
                        <TrendingUp size={9} color={c.success} />
                        <Text style={[styles.activeBadgeText, { color: c.success }]}>
                          Active
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.statValue, { color: c.text }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: c.textMuted }]}>
                    {stat.label}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ─── Scan CTA Hero ─── */}
        <View style={styles.sectionContainer}>
          <Animated.View style={heroAnimatedStyle}>
            <Pressable
              onPress={() => router.push('/scanner')}
              onPressIn={() => { heroScale.value = withSpring(0.97); }}
              onPressOut={() => { heroScale.value = withSpring(1); }}
              style={[
                styles.heroCta,
                {
                  backgroundColor: c.accentDark,
                  ...c.shadow.glow(c.accent),
                },
              ]}
            >
              {/* Decorative circle top-right — floating */}
              <Animated.View style={[styles.heroDecoCircle1, floatStyle1]} />
              {/* Decorative circle bottom-left — floating */}
              <Animated.View style={[styles.heroDecoCircle2, floatStyle2]} />
              {/* Decorative ring — floating */}
              <Animated.View style={[styles.heroDecoRing, floatStyle3]} />

              <View style={styles.heroContent}>
                <View style={styles.heroIconWrap}>
                  <ScanLine size={28} color="#fff" strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>Scan Business Card</Text>
                  <Text style={styles.heroSubtitle}>
                    AI extracts contacts instantly
                  </Text>
                </View>
                <View style={styles.heroArrowWrap}>
                  <ChevronRight size={22} color="#fff" />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </View>

        {/* ─── Quick Actions ─── */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>
            Quick Actions
          </Text>

          <View style={styles.quickActionsRow}>
            {/* Contacts */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/cards')}
              activeOpacity={0.7}
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: c.cardBg,
                  borderColor: c.cardBorderSubtle,
                  ...c.shadow.sm,
                },
              ]}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: c.infoSoft },
                ]}
              >
                <Users size={22} color={c.info} strokeWidth={1.8} />
              </View>
              <Text style={[styles.quickActionLabel, { color: c.text }]}>
                Contacts
              </Text>
              <Text style={[styles.quickActionSub, { color: c.textMuted }]}>
                {cards.length} saved
              </Text>
            </TouchableOpacity>

            {/* AI Chat */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/chat')}
              activeOpacity={0.7}
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: c.cardBg,
                  borderColor: c.cardBorderSubtle,
                  ...c.shadow.sm,
                },
              ]}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: isDark ? 'rgba(167, 139, 250, 0.12)' : 'rgba(139, 92, 246, 0.08)' },
                ]}
              >
                <MessageCircle size={22} color="#a78bfa" strokeWidth={1.8} />
              </View>
              <Text style={[styles.quickActionLabel, { color: c.text }]}>
                AI Chat
              </Text>
              <Text style={[styles.quickActionSub, { color: c.textMuted }]}>
                Ask anything
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Recent Contacts ─── */}
        {hasCards && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: c.textMuted }]}>
                Recent Contacts
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/cards')}
                style={styles.seeAllBtn}
                activeOpacity={0.7}
              >
                <Text style={[styles.seeAllText, { color: c.accent }]}>
                  See All
                </Text>
                <ChevronRight size={14} color={c.accent} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.contactsListCard,
                {
                  backgroundColor: c.cardBg,
                  borderColor: c.cardBorderSubtle,
                  ...c.shadow.sm,
                },
              ]}
            >
              {cards.slice(0, 3).map((card, idx) => {
                const colorIndex = card.name
                  ? card.name.charCodeAt(0) % c.avatarColors.length
                  : 0;
                const avatarColor = c.avatarColors[colorIndex];

                return (
                  <TouchableOpacity
                    key={card.id}
                    onPress={() => router.push(`/card/${card.id}`)}
                    activeOpacity={0.7}
                    style={[
                      styles.contactRow,
                      idx < Math.min(cards.length, 3) - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: c.cardBorderSubtle,
                      },
                    ]}
                  >
                    {/* Refined avatar */}
                    <View
                      style={[
                        styles.avatar,
                        {
                          backgroundColor: avatarColor + '18',
                          borderColor: avatarColor + '30',
                        },
                      ]}
                    >
                      <Text style={[styles.avatarText, { color: avatarColor }]}>
                        {(card.name || '?')[0].toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.contactName, { color: c.text }]}
                        numberOfLines={1}
                      >
                        {card.name || 'Unknown'}
                      </Text>
                      <Text
                        style={[styles.contactDetail, { color: c.textMuted }]}
                        numberOfLines={1}
                      >
                        {card.company || card.job_title || card.email || 'No details'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.contactArrow,
                        { backgroundColor: c.bgSubtle },
                      ]}
                    >
                      <ChevronRight size={14} color={c.textMuted} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── Empty State ─── */}
        {!hasCards && (
          <View style={styles.sectionContainer}>
            <View
              style={[
                styles.emptyStateCard,
                {
                  backgroundColor: c.cardBg,
                  borderColor: c.cardBorderSubtle,
                  ...c.shadow.md,
                },
              ]}
            >
              {/* Decorative glow */}
              <View
                style={[
                  styles.emptyStateGlow,
                  { backgroundColor: c.accentSoft },
                ]}
              />
              <View style={styles.emptyStateContent}>
                <View
                  style={[
                    styles.emptyStateIcon,
                    {
                      backgroundColor: c.accentSoft,
                      borderColor: c.accent + '20',
                    },
                  ]}
                >
                  <Zap size={20} color={c.accent} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.emptyStateTitle, { color: c.text }]}>
                    Get started
                  </Text>
                  <Text style={[styles.emptyStateDesc, { color: c.textSecondary }]}>
                    Scan your first business card to start building your digital
                    network. Our AI will extract all contact details automatically.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ─── Pro Tip ─── */}
        {hasCards && (
          <View style={[styles.sectionContainer, { marginTop: spacing.md }]}>
            <View
              style={[
                styles.proTipCard,
                {
                  backgroundColor: c.accentSoft,
                  borderColor: c.accent + '25',
                },
              ]}
            >
              <View
                style={[
                  styles.proTipIconWrap,
                  { backgroundColor: c.accent + '20' },
                ]}
              >
                <Clock size={14} color={c.accent} />
              </View>
              <Text style={[styles.proTipText, { color: c.accentLight }]}>
                <Text style={{ fontWeight: '700' }}>Pro Tip: </Text>
                Use AI Chat to search contacts by company or role
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ── Header ── */
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoMark: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
    letterSpacing: 0.3,
  },
  signOutBtn: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
  },

  /* ── Greeting ── */
  greetingSection: {
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing['2xl'],
  },
  greetingLabel: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  greetingName: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 2,
  },
  accentLine: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginTop: spacing.md,
    opacity: 0.7,
  },

  /* ── Section Containers ── */
  sectionContainer: {
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  /* ── Stats Grid ── */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47.5%',
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  statTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  statCardInner: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statIconWrap: {
    height: 38,
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    gap: 3,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },

  /* ── Hero CTA ── */
  heroCta: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['2xl'],
  },
  heroIconWrap: {
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.xl,
    marginRight: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 3,
    fontWeight: '500',
  },
  heroArrowWrap: {
    height: 42,
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroDecoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroDecoCircle2: {
    position: 'absolute',
    bottom: -40,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroDecoRing: {
    position: 'absolute',
    top: 10,
    right: 60,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  /* ── Quick Actions ── */
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  quickActionIcon: {
    height: 52,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    marginBottom: spacing.md,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  quickActionSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },

  /* ── Recent Contacts ── */
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactsListCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  avatar: {
    height: 46,
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    marginRight: spacing.md,
    borderWidth: 1.5,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  contactDetail: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '400',
  },
  contactArrow: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    marginLeft: spacing.sm,
  },

  /* ── Empty State ── */
  emptyStateCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  emptyStateGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.5,
  },
  emptyStateContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  emptyStateIcon: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  emptyStateDesc: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 20,
    fontWeight: '400',
  },

  /* ── Pro Tip ── */
  proTipCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  proTipIconWrap: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  proTipText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
});
