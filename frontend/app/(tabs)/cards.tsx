import { useAuth } from '@/lib/auth-context';
import { useContacts, Card } from '@/lib/contacts-context';
import { BACKEND_URL } from '@/lib/api';
import { formatIndianPhone } from '@/lib/locale';
import { useRouter } from 'expo-router';
import { Search, Trash2, ChevronRight, Users, FileSpreadsheet, FileText } from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { premiumColors, radius, spacing } from '@/lib/premium-theme';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

/* ── Animated contact card with 3D tilt on press ── */
function AnimatedContactCard({
  item,
  index,
  c,
  router,
  confirmDelete,
}: {
  item: Card;
  index: number;
  c: ReturnType<typeof premiumColors>;
  router: ReturnType<typeof useRouter>;
  confirmDelete: (id: string, name: string) => void;
}) {
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${rotateX.value}deg` },
      { scale: scale.value },
    ],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.98);
    rotateX.value = withSpring(2);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
    rotateX.value = withSpring(0);
  };

  const initials = (item.name || '?')[0].toUpperCase();
  const colorIndex = item.name ? item.name.charCodeAt(0) % c.avatarColors.length : 0;
  const avatarColor = c.avatarColors[colorIndex];

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={animatedStyle}
    >
      <Pressable
        onPress={() => router.push(`/card/${item.id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          backgroundColor: c.cardBg,
          borderColor: c.cardBorderSubtle,
          borderWidth: 1,
          borderRadius: radius.xl,
          marginBottom: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          ...c.shadow.sm,
        }}
      >
        {/* Avatar */}
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: radius.lg,
            backgroundColor: `${avatarColor}18`,
            borderWidth: 1,
            borderColor: `${avatarColor}30`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.lg,
          }}
        >
          <Text style={{ color: avatarColor, fontSize: 15, fontWeight: '700' }}>
            {initials}
          </Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: c.text, fontSize: 14, fontWeight: '600', letterSpacing: -0.1 }}
            numberOfLines={1}
          >
            {item.name || 'Unknown'}
          </Text>
          <Text
            style={{ color: c.textSecondary, fontSize: 12, marginTop: 3 }}
            numberOfLines={1}
          >
            {[item.job_title, item.company].filter(Boolean).join(' at ') || item.email || 'No details'}
          </Text>
          {item.phone ? (
            <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 2, fontWeight: '500' }}>
              {formatIndianPhone(item.phone)}
            </Text>
          ) : null}
        </View>

        {/* Delete — subtle */}
        <TouchableOpacity
          onPress={() => confirmDelete(item.id, item.name)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: radius.sm,
            backgroundColor: c.dangerSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.sm,
          }}
        >
          <Trash2 size={13} color={c.danger} strokeWidth={2} />
        </TouchableOpacity>

        <ChevronRight size={14} color={c.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

export default function CardsScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { cards, loading, fetchCards, deleteCard } = useContacts();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const c = premiumColors(isDark);

  useEffect(() => {
    if (user) fetchCards();
  }, [user]);

  const filtered = cards.filter((c_item) => {
    const q = search.toLowerCase();
    return (
      (c_item.name || '').toLowerCase().includes(q) ||
      (c_item.company || '').toLowerCase().includes(q) ||
      (c_item.email || '').toLowerCase().includes(q) ||
      (c_item.phone || '').toLowerCase().includes(q)
    );
  });

  const handleExport = async (format: 'xlsx' | 'csv') => {
    setExporting(true);
    try {
      if (Platform.OS === 'web') {
        Linking.openURL(`${BACKEND_URL}/api/export?format=${format}`);
      } else {
        const fileUri = `${FileSystem.documentDirectory}captr-contacts.${format}`;
        const download = await FileSystem.downloadAsync(
          `${BACKEND_URL}/api/export?format=${format}`,
          fileUri
        );
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(download.uri);
        } else {
          Alert.alert('Success', `File saved to ${download.uri}`);
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred';
      Alert.alert('Export Error', errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Delete Contact', `Remove ${name || 'this contact'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteCard(id),
      },
    ]);
  };

  const renderCard = useCallback(
    ({ item, index }: { item: Card; index: number }) => (
      <AnimatedContactCard
        item={item}
        index={index}
        c={c}
        router={router}
        confirmDelete={confirmDelete}
      />
    ),
    [isDark, c]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)} style={{ paddingHorizontal: spacing['2xl'], paddingTop: spacing.xl, paddingBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text
              style={{
                color: c.text,
                fontSize: 24,
                fontWeight: '800',
                letterSpacing: -0.5,
              }}
            >
              Contacts
            </Text>
            <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2, fontWeight: '500' }}>
              {cards.length} {cards.length === 1 ? 'card' : 'cards'} saved
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleExport('xlsx')}
              disabled={exporting || cards.length === 0}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderRadius: radius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm + 2,
                backgroundColor: c.accentDark,
                opacity: exporting || cards.length === 0 ? 0.5 : 1,
                ...c.shadow.glow(c.accentDark),
              }}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <FileSpreadsheet size={13} color="#fff" strokeWidth={2} />
              )}
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleExport('csv')}
              disabled={exporting || cards.length === 0}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderRadius: radius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm + 2,
                backgroundColor: c.cardBg,
                borderColor: c.cardBorder,
                borderWidth: 1,
                opacity: exporting || cards.length === 0 ? 0.5 : 1,
                ...c.shadow.sm,
              }}
            >
              <FileText size={13} color={c.textSecondary} strokeWidth={2} />
              <Text style={{ color: c.text, fontSize: 11, fontWeight: '600' }}>CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            marginTop: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: radius.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md + 2,
            backgroundColor: c.inputBg,
            borderWidth: 1,
            borderColor: c.inputBorder,
          }}
        >
          <Search size={16} color={c.textMuted} strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search contacts..."
            placeholderTextColor={c.textMuted}
            style={{
              color: c.text,
              flex: 1,
              marginLeft: spacing.md,
              fontSize: 13,
              fontWeight: '500',
            }}
          />
        </View>
      </Animated.View>

      {/* Cards List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingTop: spacing.xs,
          paddingBottom: spacing['3xl'],
        }}
        refreshing={loading}
        onRefresh={fetchCards}
        ListEmptyComponent={
          <View style={{ marginTop: 96, alignItems: 'center', paddingHorizontal: spacing['2xl'] }}>
            {/* Empty state icon */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: radius['2xl'],
                backgroundColor: c.accentSoft,
                borderWidth: 1,
                borderColor: c.glassBorder,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xl,
                ...c.shadow.glow(c.accent),
              }}
            >
              <Users size={30} color={c.accent} strokeWidth={1.8} />
            </View>
            <Text
              style={{
                color: c.text,
                fontSize: 17,
                fontWeight: '700',
                marginBottom: spacing.sm,
                letterSpacing: -0.2,
              }}
            >
              {search ? 'No results found' : 'No contacts yet'}
            </Text>
            <Text
              style={{
                color: c.textSecondary,
                fontSize: 13,
                lineHeight: 19,
                textAlign: 'center',
              }}
            >
              {search ? 'Try a different search term' : 'Scan your first business card\nto get started'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
