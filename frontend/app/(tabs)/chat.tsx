import { BACKEND_URL } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    bg: isDark ? '#0c0f1a' : '#f5f7fa',
    cardBg: isDark ? '#161b2e' : '#ffffff',
    cardBorder: isDark ? '#1e2642' : '#e8ecf4',
    text: isDark ? '#eef0f6' : '#0f172a',
    textSub: isDark ? '#7c8db5' : '#64748b',
    accent: '#6366f1',
    accentSoft: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
    userBubble: isDark ? '#6366f1' : '#6366f1',
    aiBubble: isDark ? '#161b2e' : '#ffffff',
    aiBorder: isDark ? '#1e2642' : '#e8ecf4',
    inputBg: isDark ? '#111627' : '#f0f2f7',
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        "Hello! I have access to all your scanned contacts. You can ask me to find contacts, get details, or provide networking insights.",
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const history = messages
        .filter((m) => m.id !== '0')
        .map((m) => ({ role: m.role, content: m.content }));

      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, history }),
      });

      const json = await res.json();
      const reply = json.success ? json.reply : 'Sorry, something went wrong.';

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Connection error. Please try again.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content:
          "Chat cleared. I still have access to all your contacts. What would you like to know?",
      },
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View className={`mb-3 px-5 ${isUser ? 'items-end' : 'items-start'}`}>
        <View className="flex-row items-end" style={{ maxWidth: '85%', gap: 8 }}>
          {!isUser && (
            <View
              style={{ backgroundColor: colors.accentSoft }}
              className="h-7 w-7 items-center justify-center rounded-full"
            >
              <Sparkles size={12} color={colors.accent} />
            </View>
          )}
          <View
            style={{
              backgroundColor: isUser ? colors.userBubble : colors.aiBubble,
              borderColor: isUser ? 'transparent' : colors.aiBorder,
              borderWidth: isUser ? 0 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
            className={`rounded-2xl px-4 py-3 ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
          >
            <Text
              style={{ color: isUser ? '#ffffff' : colors.text }}
              className="text-[13px] leading-5"
            >
              {item.content}
            </Text>
          </View>
          {isUser && (
            <View
              style={{ backgroundColor: colors.userBubble + '20' }}
              className="h-7 w-7 items-center justify-center rounded-full"
            >
              <User size={12} color={colors.accent} />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-3">
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View
            style={{ backgroundColor: colors.accentSoft }}
            className="h-9 w-9 items-center justify-center rounded-xl"
          >
            <Sparkles size={16} color={colors.accent} />
          </View>
          <View>
            <Text style={{ color: colors.text }} className="text-[17px] font-bold">
              AI Assistant
            </Text>
            <Text style={{ color: colors.textSub }} className="text-[11px]">
              Powered by GPT-4o
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={clearChat}
          activeOpacity={0.7}
          className="flex-row items-center rounded-xl px-3 py-2.5"
          style={{ gap: 5, backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }}
        >
          <Trash2 size={12} color={colors.textSub} />
          <Text style={{ color: colors.textSub }} className="text-[11px] font-medium">
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Typing indicator */}
        {sending && (
          <View className="flex-row items-center px-5 pb-2" style={{ gap: 8 }}>
            <View
              style={{ backgroundColor: colors.accentSoft }}
              className="h-7 w-7 items-center justify-center rounded-full"
            >
              <Sparkles size={12} color={colors.accent} />
            </View>
            <View
              style={{
                backgroundColor: colors.aiBubble,
                borderColor: colors.aiBorder,
                borderWidth: 1,
              }}
              className="rounded-2xl rounded-bl-md px-4 py-3"
            >
              <View className="flex-row" style={{ gap: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, opacity: 0.4 }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, opacity: 0.6 }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, opacity: 0.8 }} />
              </View>
            </View>
          </View>
        )}

        {/* Input */}
        <View
          className="flex-row items-end px-5 py-3"
          style={{
            gap: 8,
            backgroundColor: colors.bg,
            borderTopColor: colors.cardBorder,
            borderTopWidth: 1,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your contacts..."
            placeholderTextColor={colors.textSub}
            style={{
              backgroundColor: colors.inputBg,
              color: colors.text,
              maxHeight: 100,
            }}
            className="flex-1 rounded-xl px-4 py-3 text-[13px]"
            multiline
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!input.trim() || sending}
            activeOpacity={0.7}
            style={{
              backgroundColor: input.trim() && !sending ? colors.accent : colors.inputBg,
              shadowColor: input.trim() && !sending ? colors.accent : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
            className="h-11 w-11 items-center justify-center rounded-xl"
          >
            <Send size={16} color={input.trim() && !sending ? '#fff' : colors.textSub} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
