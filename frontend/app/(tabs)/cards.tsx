import { useAuth } from '@/lib/auth-context';
import { useContacts, Card } from '@/lib/contacts-context';
import { BACKEND_URL } from '@/lib/api';
import { useRouter } from 'expo-router';
import { Search, Download, Trash2, ChevronRight, Users, FileSpreadsheet, FileText } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export default function CardsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { cards, loading, fetchCards, deleteCard } = useContacts();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const colors = {
    bg: isDark ? '#0c0f1a' : '#f5f7fa',
    cardBg: isDark ? '#161b2e' : '#ffffff',
    cardBorder: isDark ? '#1e2642' : '#e8ecf4',
    text: isDark ? '#eef0f6' : '#0f172a',
    textSub: isDark ? '#7c8db5' : '#64748b',
    accent: '#6366f1',
    accentSoft: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
    searchBg: isDark ? '#111627' : '#f0f2f7',
    danger: '#ef4444',
  };

  useEffect(() => {
    if (user) fetchCards();
  }, [user]);

  const filtered = cards.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
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
    } catch (e: any) {
      Alert.alert('Export Error', e.message);
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
    ({ item }: { item: Card }) => {
      const initials = (item.name || '?')[0].toUpperCase();
      const avatarColors = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
      const colorIndex = item.name ? item.name.charCodeAt(0) % avatarColors.length : 0;
      const avatarColor = avatarColors[colorIndex];

      return (
        <TouchableOpacity
          onPress={() => router.push(`/card/${item.id}`)}
          activeOpacity={0.7}
          style={{
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
            borderWidth: 1,
          }}
          className="mb-2 flex-row items-center rounded-2xl px-4 py-3.5"
        >
          <View
            style={{ backgroundColor: `${avatarColor}18` }}
            className="mr-3 h-11 w-11 items-center justify-center rounded-full"
          >
            <Text style={{ color: avatarColor }} className="text-sm font-bold">
              {initials}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              style={{ color: colors.text }}
              className="text-[13px] font-semibold"
              numberOfLines={1}
            >
              {item.name || 'Unknown'}
            </Text>
            <Text
              style={{ color: colors.textSub }}
              className="text-[11px] mt-0.5"
              numberOfLines={1}
            >
              {[item.job_title, item.company].filter(Boolean).join(' at ') || item.email || 'No details'}
            </Text>
            {item.phone ? (
              <Text style={{ color: colors.textSub }} className="text-[10px] mt-0.5 font-medium">
                {item.phone}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => confirmDelete(item.id, item.name)}
            className="mr-1 p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={14} color={colors.danger} />
          </TouchableOpacity>
          <ChevronRight size={14} color={colors.textSub} />
        </TouchableOpacity>
      );
    },
    [isDark, colors]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View className="px-6 pt-5 pb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text
              style={{ color: colors.text }}
              className="text-[22px] font-bold tracking-tight"
            >
              Contacts
            </Text>
            <Text style={{ color: colors.textSub }} className="text-[11px] mt-0.5">
              {cards.length} {cards.length === 1 ? 'card' : 'cards'} saved
            </Text>
          </View>
          <View className="flex-row" style={{ gap: 6 }}>
            <TouchableOpacity
              onPress={() => handleExport('xlsx')}
              disabled={exporting || cards.length === 0}
              activeOpacity={0.7}
              className="flex-row items-center rounded-xl px-3 py-2.5"
              style={{
                gap: 5,
                backgroundColor: colors.accent,
                opacity: exporting || cards.length === 0 ? 0.5 : 1,
              }}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <FileSpreadsheet size={13} color="#fff" />
              )}
              <Text className="text-[11px] font-semibold text-white">Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleExport('csv')}
              disabled={exporting || cards.length === 0}
              activeOpacity={0.7}
              className="flex-row items-center rounded-xl px-3 py-2.5"
              style={{
                gap: 5,
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                borderWidth: 1,
                opacity: exporting || cards.length === 0 ? 0.5 : 1,
              }}
            >
              <FileText size={13} color={colors.textSub} />
              <Text style={{ color: colors.text }} className="text-[11px] font-semibold">
                CSV
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View
          style={{ backgroundColor: colors.searchBg }}
          className="mt-4 flex-row items-center rounded-xl px-3.5 py-3"
        >
          <Search size={16} color={colors.textSub} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search contacts..."
            placeholderTextColor={colors.textSub}
            style={{ color: colors.text, flex: 1, marginLeft: 10 }}
            className="text-[13px]"
          />
        </View>
      </View>

      {/* Cards List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 24 }}
        refreshing={loading}
        onRefresh={fetchCards}
        ListEmptyComponent={
          <View className="mt-24 items-center">
            <View
              style={{ backgroundColor: colors.accentSoft }}
              className="h-16 w-16 items-center justify-center rounded-full mb-4"
            >
              <Users size={26} color={colors.accent} />
            </View>
            <Text
              style={{ color: colors.text }}
              className="text-[15px] font-semibold mb-1"
            >
              {search ? 'No results found' : 'No contacts yet'}
            </Text>
            <Text
              style={{ color: colors.textSub }}
              className="text-center text-[12px] leading-4"
            >
              {search ? 'Try a different search term' : 'Scan your first business card\nto get started'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
