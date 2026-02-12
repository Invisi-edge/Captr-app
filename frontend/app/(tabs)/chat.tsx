import { BACKEND_URL } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { useTheme } from '@/lib/theme-context';
import { Send, User, Trash2, Sparkles, Crown } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { premiumColors, radius, spacing } from '@/lib/premium-theme';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';

/* ── Breathing AI avatar with pulsing scale ── */
function BreathingAvatar({ color }: { color: string }) {
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Sparkles size={13} color={color} strokeWidth={2} />
    </Animated.View>
  );
}

/* ── Animated typing dot with sequential pulse ── */
function AnimatedTypingDot({ delay, color }: { delay: number; color: string }) {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width: 7, height: 7, borderRadius: 3.5, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatScreen() {
  const { isDark } = useTheme();
  const c = premiumColors(isDark);

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

  // Send button scale animation
  const sendScale = useSharedValue(1);
  const sendAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

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
    } catch (e: unknown) {
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
      <Animated.View
        entering={isUser ? FadeInUp.duration(300) : FadeInDown.duration(300)}
        style={{
          marginBottom: spacing.lg,
          paddingHorizontal: spacing.xl,
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '85%', gap: 10 }}>
          {/* AI avatar with breathing animation */}
          {!isUser && (
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: radius.md,
                backgroundColor: c.accentSoft,
                borderWidth: 1,
                borderColor: c.glassBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BreathingAvatar color={c.accent} />
            </View>
          )}

          {/* Message bubble */}
          <View
            style={{
              backgroundColor: isUser ? c.accentDark : c.glassBg,
              borderColor: isUser ? 'transparent' : c.glassBorder,
              borderWidth: isUser ? 0 : 1,
              borderRadius: radius.xl,
              borderBottomRightRadius: isUser ? radius.xs : radius.xl,
              borderBottomLeftRadius: isUser ? radius.xl : radius.xs,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md + 2,
              ...(isUser ? c.shadow.glow(c.accentDark) : c.shadow.sm),
            }}
          >
            <Text
              style={{
                color: isUser ? '#ffffff' : c.text,
                fontSize: 13.5,
                lineHeight: 21,
                fontWeight: isUser ? '500' : '400',
              }}
            >
              {item.content}
            </Text>
          </View>

          {/* User avatar */}
          {isUser && (
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: radius.md,
                backgroundColor: `${c.accentDark}25`,
                borderWidth: 1,
                borderColor: `${c.accentDark}40`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={13} color={c.accentLight} strokeWidth={2} />
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Premium header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing['2xl'],
          paddingVertical: spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: c.cardBorderSubtle,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.lg,
              backgroundColor: c.accentSoft,
              borderWidth: 1,
              borderColor: c.glassBorder,
              alignItems: 'center',
              justifyContent: 'center',
              ...c.shadow.glow(c.accent),
            }}
          >
            <Sparkles size={18} color={c.accent} strokeWidth={2} />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text
                style={{
                  color: c.text,
                  fontSize: 18,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                }}
              >
                AI Assistant
              </Text>
              <View
                style={{
                  backgroundColor: '#10b98120',
                  borderWidth: 1,
                  borderColor: '#10b98140',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: radius.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Crown size={10} color="#10b981" />
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#10b981', letterSpacing: 0.5 }}>ACTIVE</Text>
              </View>
            </View>
            <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '500', marginTop: 1 }}>
              Powered by GPT-4o
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={clearChat}
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
            ...c.shadow.sm,
          }}
        >
          <Trash2 size={12} color={c.textMuted} strokeWidth={2} />
          <Text style={{ color: c.textSecondary, fontSize: 11, fontWeight: '600' }}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: spacing.xl }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Typing indicator */}
        {sending && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.xl,
              paddingBottom: spacing.md,
              gap: 10,
            }}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: radius.md,
                backgroundColor: c.accentSoft,
                borderWidth: 1,
                borderColor: c.glassBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={13} color={c.accent} strokeWidth={2} />
            </View>
            <View
              style={{
                backgroundColor: c.glassBg,
                borderColor: c.glassBorder,
                borderWidth: 1,
                borderRadius: radius.xl,
                borderBottomLeftRadius: radius.xs,
                paddingHorizontal: spacing.lg + 2,
                paddingVertical: spacing.md + 2,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <AnimatedTypingDot delay={0} color={c.accentLight} />
                <AnimatedTypingDot delay={150} color={c.accentLight} />
                <AnimatedTypingDot delay={300} color={c.accentLight} />
              </View>
            </View>
          </View>
        )}

        {/* Premium input area — extra bottom padding for floating tab bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: Platform.OS === 'ios' ? 100 : 88,
            gap: 10,
            backgroundColor: c.bgElevated,
            borderTopWidth: 1,
            borderTopColor: c.cardBorderSubtle,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your contacts..."
            placeholderTextColor={c.textMuted}
            style={{
              flex: 1,
              backgroundColor: c.inputBg,
              borderWidth: 1,
              borderColor: c.inputBorder,
              borderRadius: radius.lg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              color: c.text,
              fontSize: 13.5,
              fontWeight: '500',
              maxHeight: 100,
            }}
            multiline
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <Animated.View style={sendAnimatedStyle}>
            <Pressable
              onPress={sendMessage}
              onPressIn={() => { sendScale.value = withSpring(0.9); }}
              onPressOut={() => { sendScale.value = withSpring(1); }}
              disabled={!input.trim() || sending}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: input.trim() && !sending ? c.accentDark : c.inputBg,
                borderWidth: input.trim() && !sending ? 0 : 1,
                borderColor: c.inputBorder,
                ...(input.trim() && !sending ? c.shadow.glow(c.accentDark) : {}),
              }}
            >
              <Send
                size={17}
                color={input.trim() && !sending ? '#fff' : c.textMuted}
                strokeWidth={2}
              />
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
