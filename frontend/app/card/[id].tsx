import { BACKEND_URL } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { useContacts, Card } from '@/lib/contacts-context';
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
import { useColorScheme } from 'nativewind';
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

export default function CardDetailScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cards, deleteCard, fetchCards } = useContacts();

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  const colors = {
    bg: isDark ? '#0c0f1a' : '#f5f7fa',
    cardBg: isDark ? '#161b2e' : '#ffffff',
    cardBorder: isDark ? '#1e2642' : '#e8ecf4',
    text: isDark ? '#eef0f6' : '#0f172a',
    textSub: isDark ? '#7c8db5' : '#64748b',
    accent: '#6366f1',
    accentSoft: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
    danger: '#ef4444',
  };

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
    } catch (e) {
      console.error('fetch card error:', e);
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
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save contact');
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.textSub }} className="text-[13px]">
            Contact not found
          </Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text style={{ color: colors.accent }} className="text-[13px] font-semibold">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const quickActions = [
    card.phone ? { icon: Phone, label: 'Call', onPress: handleCall, color: '#10b981' } : null,
    card.email ? { icon: Mail, label: 'Email', onPress: handleEmail, color: '#06b6d4' } : null,
    card.website ? { icon: Globe, label: 'Web', onPress: handleWebsite, color: '#8b5cf6' } : null,
    { icon: UserPlus, label: 'Save', onPress: handleSaveToContacts, color: '#f59e0b' },
  ].filter(Boolean) as { icon: any; label: string; onPress: () => void; color: string }[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="flex-row items-center rounded-xl px-3 py-2"
          style={{ gap: 4, backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }}
        >
          <ArrowLeft size={16} color={colors.text} />
          <Text style={{ color: colors.text }} className="text-[12px] font-medium">
            Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.7}
          className="rounded-xl p-2.5"
          style={{ backgroundColor: `${colors.danger}12` }}
        >
          <Trash2 size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View className="items-center px-6 py-8">
          <View
            style={{
              backgroundColor: colors.accentSoft,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
            }}
            className="mb-4 h-20 w-20 items-center justify-center rounded-full"
          >
            <Text style={{ color: colors.accent }} className="text-2xl font-bold">
              {(card.name || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: colors.text }} className="text-[20px] font-bold text-center tracking-tight">
            {card.name || 'Unknown'}
          </Text>
          {card.job_title ? (
            <Text style={{ color: colors.textSub }} className="mt-1 text-[13px] text-center">
              {card.job_title}
            </Text>
          ) : null}
          {card.company ? (
            <View className="flex-row items-center mt-1" style={{ gap: 4 }}>
              <Building2 size={11} color={colors.textSub} />
              <Text style={{ color: colors.textSub }} className="text-[12px]">
                {card.company}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-center px-6 mb-8" style={{ gap: 16 }}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={action.onPress}
              activeOpacity={0.7}
              className="items-center"
              style={{ gap: 6 }}
            >
              <View
                style={{
                  backgroundColor: `${action.color}15`,
                  shadowColor: action.color,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }}
                className="h-12 w-12 items-center justify-center rounded-2xl"
              >
                <action.icon size={18} color={action.color} />
              </View>
              <Text style={{ color: colors.textSub }} className="text-[10px] font-medium">
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Details */}
        <View className="px-6">
          <Text
            style={{ color: colors.textSub }}
            className="mb-3 text-[11px] font-semibold uppercase tracking-widest"
          >
            Contact Details
          </Text>

          <View
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
            }}
            className="rounded-2xl overflow-hidden"
          >
            {card.phone ? (
              <DetailRow
                icon={<Phone size={15} color="#10b981" />}
                iconBg="#10b98115"
                label="Phone"
                value={card.phone}
                onPress={handleCall}
                colors={colors}
              />
            ) : null}
            {card.email ? (
              <DetailRow
                icon={<Mail size={15} color="#06b6d4" />}
                iconBg="#06b6d415"
                label="Email"
                value={card.email}
                onPress={handleEmail}
                colors={colors}
              />
            ) : null}
            {card.website ? (
              <DetailRow
                icon={<Globe size={15} color="#8b5cf6" />}
                iconBg="#8b5cf615"
                label="Website"
                value={card.website}
                onPress={handleWebsite}
                colors={colors}
              />
            ) : null}
            {card.company ? (
              <DetailRow
                icon={<Building2 size={15} color="#f59e0b" />}
                iconBg="#f59e0b15"
                label="Company"
                value={card.company}
                colors={colors}
              />
            ) : null}
            {card.job_title ? (
              <DetailRow
                icon={<Briefcase size={15} color="#ec4899" />}
                iconBg="#ec489915"
                label="Title"
                value={card.job_title}
                colors={colors}
              />
            ) : null}
            {card.address ? (
              <DetailRow
                icon={<MapPin size={15} color="#ef4444" />}
                iconBg="#ef444415"
                label="Address"
                value={card.address}
                colors={colors}
              />
            ) : null}
            {card.notes ? (
              <DetailRow
                icon={<StickyNote size={15} color="#6366f1" />}
                iconBg="#6366f115"
                label="Notes"
                value={card.notes}
                colors={colors}
                isLast
              />
            ) : null}
          </View>
        </View>

        {/* Card Images */}
        {(card.front_image_url || card.back_image_url) && (
          <View className="px-6 mt-6">
            <Text
              style={{ color: colors.textSub }}
              className="mb-3 text-[11px] font-semibold uppercase tracking-widest"
            >
              Card Images
            </Text>
            <View className="flex-row" style={{ gap: 8 }}>
              {card.front_image_url ? (
                <View className="flex-1">
                  <Text style={{ color: colors.textSub }} className="mb-1.5 text-[10px] font-medium">
                    Front
                  </Text>
                  <Image
                    source={{ uri: card.front_image_url }}
                    style={{
                      height: 110,
                      borderRadius: 16,
                      backgroundColor: colors.cardBg,
                    }}
                    resizeMode="cover"
                  />
                </View>
              ) : null}
              {card.back_image_url ? (
                <View className="flex-1">
                  <Text style={{ color: colors.textSub }} className="mb-1.5 text-[10px] font-medium">
                    Back
                  </Text>
                  <Image
                    source={{ uri: card.back_image_url }}
                    style={{
                      height: 110,
                      borderRadius: 16,
                      backgroundColor: colors.cardBg,
                    }}
                    resizeMode="cover"
                  />
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Scanned date */}
        {card.created_at && (
          <View className="px-6 mt-8">
            <Text style={{ color: colors.textSub }} className="text-[11px] text-center">
              Added {new Date(card.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  iconBg,
  label,
  value,
  onPress,
  colors,
  isLast,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  onPress?: () => void;
  colors: any;
  isLast?: boolean;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.cardBorder }}
      className="flex-row items-center px-4 py-3.5"
    >
      <View
        style={{ backgroundColor: iconBg }}
        className="mr-3 h-8 w-8 items-center justify-center rounded-lg"
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text style={{ color: colors.textSub }} className="text-[10px] font-medium uppercase tracking-wide">
          {label}
        </Text>
        <Text
          style={{ color: onPress ? colors.accent : colors.text }}
          className="text-[13px] mt-0.5 font-medium"
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </Wrapper>
  );
}
