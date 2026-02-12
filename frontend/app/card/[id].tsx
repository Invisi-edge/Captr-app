import { BACKEND_URL } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { useContacts, Card } from '@/lib/contacts-context';
import { premiumColors, radius, spacing } from '@/lib/premium-theme';
import { formatDate, formatIndianPhone } from '@/lib/locale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  Briefcase,
  Building2,
  UserPlus,
  Trash2,
  StickyNote,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Contacts from 'expo-contacts';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

export default function CardDetailScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cards, deleteCard, fetchCards } = useContacts();

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  const colors = premiumColors(isDark);

  // Floating avatar animation
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1500 }),
        withTiming(4, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  useEffect(() => {
    const found = cards.find((c) => c.id === id);
    if (found) {
      setCard(found);
      setLoading(false);
    } else {
      fetchCardFromAPI();
    }
  }, [id, cards]);

  const fetchCardFromAPI = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/cards/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (json.success) {
        setCard(json.data);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An error occurred';
      // Fetch card error silenced for production
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (card?.phone) Linking.openURL(`tel:${card.phone}`);
  };

  const handleEmail = () => {
    if (card?.email) Linking.openURL(`mailto:${card.email}`);
  };

  const handleWebsite = () => {
    if (card?.website) {
      const url = card.website.startsWith('http') ? card.website : `https://${card.website}`;
      Linking.openURL(url);
    }
  };

  const handleSaveToContacts = async () => {
    if (!card) return;

    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Saving to contacts is not available on web.');
      return;
    }

    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Contacts permission is needed to save.');
      return;
    }

    const contact: Contacts.Contact = {
      contactType: Contacts.ContactTypes.Person,
      name: card.name || '',
      firstName: card.name?.split(' ')[0] || '',
      lastName: card.name?.split(' ').slice(1).join(' ') || '',
      jobTitle: card.job_title || '',
      company: card.company || '',
      emails: card.email ? [{ email: card.email, label: 'work' }] : [],
      phoneNumbers: card.phone ? [{ number: card.phone, label: 'work' }] : [],
      urlAddresses: card.website ? [{ url: card.website, label: 'work' }] : [],
      addresses: card.address
        ? [{ street: card.address, label: 'work', city: '', region: '', postalCode: '', country: '', isoCountryCode: '' }]
        : [],
      note: card.notes || '',
    };

    try {
      await Contacts.addContactAsync(contact);
      Alert.alert('Saved', `${card.name || 'Contact'} has been saved to your phone contacts.`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An error occurred';
      Alert.alert('Error', message || 'Failed to save contact');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Contact', `Remove ${card?.name || 'this contact'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (id) {
            await deleteCard(id);
            router.back();
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Contact not found
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const quickActions = [
    card.phone ? { icon: Phone, label: 'Call', onPress: handleCall, color: colors.success } : null,
    card.email ? { icon: Mail, label: 'Email', onPress: handleEmail, color: colors.info } : null,
    card.website ? { icon: Globe, label: 'Web', onPress: handleWebsite, color: '#a78bfa' } : null,
    { icon: UserPlus, label: 'Save', onPress: handleSaveToContacts, color: colors.warning },
  ].filter(Boolean) as { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; onPress: () => void; color: string }[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing['2xl'],
          paddingVertical: spacing.lg,
        }}
      >
        <ScalePressable
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
            borderWidth: 1,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            ...colors.shadow.sm,
          }}
        >
          <ArrowLeft size={16} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '500' }}>
            Back
          </Text>
        </ScalePressable>
        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.7}
          style={{
            borderRadius: radius.lg,
            padding: spacing.md,
            backgroundColor: colors.dangerSoft,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(248, 113, 113, 0.2)' : 'rgba(248, 113, 113, 0.15)',
          }}
        >
          <Trash2 size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Profile Header with Gradient Accent Background */}
        <View style={{ alignItems: 'center', paddingHorizontal: spacing['3xl'] }}>
          {/* Gradient accent band behind avatar */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 100,
              backgroundColor: colors.accentSoft,
              borderBottomLeftRadius: radius['3xl'],
              borderBottomRightRadius: radius['3xl'],
            }}
          />
          {/* Subtle glow orb */}
          <View
            style={{
              position: 'absolute',
              top: -20,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: colors.accentGlow,
              opacity: 0.4,
            }}
          />

          {/* Avatar */}
          <Animated.View
            entering={FadeIn.duration(600)}
            style={[floatingStyle, {
              marginTop: spacing['3xl'],
              marginBottom: spacing.xl,
              width: 88,
              height: 88,
              borderRadius: 44,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.accentDark,
              borderWidth: 3,
              borderColor: colors.accent,
              ...colors.shadow.glow(colors.accent),
            }]}
          >
            <Text style={{ color: '#ffffff', fontSize: 30, fontWeight: '700' }}>
              {(card.name || '?')[0].toUpperCase()}
            </Text>
          </Animated.View>

          <Text
            style={{
              color: colors.text,
              fontSize: 22,
              fontWeight: '800',
              textAlign: 'center',
              letterSpacing: -0.5,
            }}
          >
            {card.name || 'Unknown'}
          </Text>

          {card.job_title ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                textAlign: 'center',
                marginTop: 4,
                fontWeight: '500',
              }}
            >
              {card.job_title}
            </Text>
          ) : null}

          {card.company ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 6,
                gap: 5,
                backgroundColor: colors.accentSoft,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radius.full,
              }}
            >
              <Building2 size={12} color={colors.accent} />
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>
                {card.company}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Quick Actions */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingHorizontal: spacing['2xl'],
            marginTop: spacing['3xl'],
            marginBottom: spacing['3xl'],
            gap: spacing.xl,
          }}
        >
          {quickActions.map((action, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 80).duration(400)}>
              <ScalePressable
                onPress={action.onPress}
                activeOpacity={0.7}
                style={{ alignItems: 'center', gap: 8 }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: radius.xl,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark
                      ? `${action.color}18`
                      : `${action.color}12`,
                    borderWidth: 1,
                    borderColor: isDark
                      ? `${action.color}30`
                      : `${action.color}20`,
                    ...colors.shadow.glow(action.color),
                  }}
                >
                  <action.icon size={20} color={action.color} />
                </View>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.3,
                  }}
                >
                  {action.label}
                </Text>
              </ScalePressable>
            </Animated.View>
          ))}
        </View>

        {/* Contact Details */}
        <View style={{ paddingHorizontal: spacing['2xl'] }}>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: spacing.md,
            }}
          >
            Contact Details
          </Text>

          <View
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              borderRadius: radius.xl,
              overflow: 'hidden',
              ...colors.shadow.md,
            }}
          >
            {card.phone ? (
              <DetailRow
                index={0}
                icon={<Phone size={16} color={colors.success} />}
                iconBg={colors.successSoft}
                iconAccent={colors.success}
                label="Phone"
                value={formatIndianPhone(card.phone)}
                onPress={handleCall}
                colors={colors}
                isDark={isDark}
              />
            ) : null}
            {card.email ? (
              <DetailRow
                index={1}
                icon={<Mail size={16} color={colors.info} />}
                iconBg={colors.infoSoft}
                iconAccent={colors.info}
                label="Email"
                value={card.email}
                onPress={handleEmail}
                colors={colors}
                isDark={isDark}
              />
            ) : null}
            {card.website ? (
              <DetailRow
                index={2}
                icon={<Globe size={16} color="#a78bfa" />}
                iconBg={isDark ? 'rgba(167, 139, 250, 0.12)' : 'rgba(167, 139, 250, 0.08)'}
                iconAccent="#a78bfa"
                label="Website"
                value={card.website}
                onPress={handleWebsite}
                colors={colors}
                isDark={isDark}
              />
            ) : null}
            {card.company ? (
              <DetailRow
                index={3}
                icon={<Building2 size={16} color={colors.warning} />}
                iconBg={colors.warningSoft}
                iconAccent={colors.warning}
                label="Company"
                value={card.company}
                colors={colors}
                isDark={isDark}
              />
            ) : null}
            {card.job_title ? (
              <DetailRow
                index={4}
                icon={<Briefcase size={16} color="#f472b6" />}
                iconBg={isDark ? 'rgba(244, 114, 182, 0.12)' : 'rgba(244, 114, 182, 0.08)'}
                iconAccent="#f472b6"
                label="Title"
                value={card.job_title}
                colors={colors}
                isDark={isDark}
              />
            ) : null}
            {card.address ? (
              <DetailRow
                index={5}
                icon={<MapPin size={16} color={colors.danger} />}
                iconBg={colors.dangerSoft}
                iconAccent={colors.danger}
                label="Address"
                value={card.address}
                colors={colors}
                isDark={isDark}
              />
            ) : null}
            {card.notes ? (
              <DetailRow
                index={6}
                icon={<StickyNote size={16} color={colors.accent} />}
                iconBg={colors.accentSoft}
                iconAccent={colors.accent}
                label="Notes"
                value={card.notes}
                colors={colors}
                isDark={isDark}
                isLast
              />
            ) : null}
          </View>
        </View>

        {/* Card Images */}
        {(card.front_image_url || card.back_image_url) && (
          <View style={{ paddingHorizontal: spacing['2xl'], marginTop: spacing['3xl'] }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                marginBottom: spacing.md,
              }}
            >
              Card Images
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              {card.front_image_url ? (
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 10,
                      fontWeight: '600',
                      marginBottom: 6,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    Front
                  </Text>
                  <View
                    style={{
                      borderRadius: radius.xl,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: colors.cardBorder,
                      ...colors.shadow.sm,
                    }}
                  >
                    <Image
                      source={{ uri: card.front_image_url }}
                      style={{
                        height: 120,
                        backgroundColor: colors.cardBg,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              ) : null}
              {card.back_image_url ? (
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 10,
                      fontWeight: '600',
                      marginBottom: 6,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    Back
                  </Text>
                  <View
                    style={{
                      borderRadius: radius.xl,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: colors.cardBorder,
                      ...colors.shadow.sm,
                    }}
                  >
                    <Image
                      source={{ uri: card.back_image_url }}
                      style={{
                        height: 120,
                        backgroundColor: colors.cardBg,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Scanned date */}
        {card.created_at && (
          <View style={{ paddingHorizontal: spacing['2xl'], marginTop: spacing['4xl'] }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              Added {formatDate(card.created_at)}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  index = 0,
  icon,
  iconBg,
  iconAccent,
  label,
  value,
  onPress,
  colors,
  isDark,
  isLast,
}: {
  index?: number;
  icon: React.ReactNode;
  iconBg: string;
  iconAccent: string;
  label: string;
  value: string;
  onPress?: () => void;
  colors: ReturnType<typeof premiumColors>;
  isDark: boolean;
  isLast?: boolean;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60)}>
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.cardBorderSubtle,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: 15,
      }}
    >
      <View
        style={{
          backgroundColor: iconBg,
          width: 36,
          height: 36,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.lg,
          borderWidth: 1,
          borderColor: isDark ? `${iconAccent}20` : `${iconAccent}15`,
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 10,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: onPress ? colors.accent : colors.text,
            fontSize: 14,
            marginTop: 2,
            fontWeight: '500',
          }}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </Wrapper>
    </Animated.View>
  );
}

function ScalePressable({ onPress, style, children, activeOpacity = 0.7, ...rest }: React.ComponentProps<typeof TouchableOpacity>) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPressIn={() => {
          scale.value = withSpring(0.93, { damping: 15, stiffness: 150 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        }}
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={style}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
