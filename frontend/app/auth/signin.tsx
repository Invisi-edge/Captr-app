import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

export default function SignInScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = {
    bg: isDark ? '#0c0f1a' : '#f5f7fa',
    cardBg: isDark ? '#161b2e' : '#ffffff',
    cardBorder: isDark ? '#1e2642' : '#e8ecf4',
    text: isDark ? '#eef0f6' : '#0f172a',
    textSub: isDark ? '#7c8db5' : '#64748b',
    accent: '#6366f1',
    accentSoft: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
    inputBg: isDark ? '#111627' : '#f0f2f7',
    danger: '#ef4444',
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later.'
        : err.message || 'Sign in failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="pt-4 pb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="flex-row items-center rounded-xl self-start px-3 py-2"
              style={{ gap: 4, backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }}
            >
              <ArrowLeft size={16} color={colors.text} />
              <Text style={{ color: colors.text }} className="text-[12px] font-medium">Back</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View className="mb-8">
            <Text
              style={{ color: colors.text }}
              className="text-[26px] font-bold tracking-tight"
            >
              Welcome back
            </Text>
            <Text
              style={{ color: colors.textSub }}
              className="mt-1.5 text-[14px]"
            >
              Sign in to access your contacts
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <View
              style={{ backgroundColor: `${colors.danger}12` }}
              className="rounded-xl px-4 py-3 mb-4"
            >
              <Text style={{ color: colors.danger }} className="text-[12px]">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View className="mb-3">
            <Text style={{ color: colors.textSub }} className="text-[11px] font-semibold uppercase tracking-widest mb-1.5">
              Email
            </Text>
            <View
              style={{ backgroundColor: colors.inputBg }}
              className="flex-row items-center rounded-xl px-4"
            >
              <Mail size={16} color={colors.textSub} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.textSub}
                style={{ color: colors.text, flex: 1, marginLeft: 10 }}
                className="text-[14px] py-4"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-5">
            <Text style={{ color: colors.textSub }} className="text-[11px] font-semibold uppercase tracking-widest mb-1.5">
              Password
            </Text>
            <View
              style={{ backgroundColor: colors.inputBg }}
              className="flex-row items-center rounded-xl px-4"
            >
              <Lock size={16} color={colors.textSub} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSub}
                style={{ color: colors.text, flex: 1, marginLeft: 10 }}
                className="text-[14px] py-4"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={16} color={colors.textSub} />
                ) : (
                  <Eye size={16} color={colors.textSub} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
            className="w-full items-center justify-center rounded-2xl"
            style={{
              paddingVertical: 18,
              backgroundColor: colors.accent,
              opacity: loading ? 0.7 : 1,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[15px] font-semibold text-white">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6" style={{ gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.cardBorder }} />
            <Text style={{ color: colors.textSub }} className="text-[11px]">or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.cardBorder }} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.7}
            className="w-full flex-row items-center justify-center rounded-2xl"
            style={{
              paddingVertical: 18,
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              gap: 10,
              opacity: googleLoading ? 0.7 : 1,
            }}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Text style={{ fontSize: 18 }}>G</Text>
                <Text style={{ color: colors.text }} className="text-[14px] font-semibold">
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Switch to Sign Up */}
          <View className="flex-row items-center justify-center mt-8 mb-4">
            <Text style={{ color: colors.textSub }} className="text-[13px]">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/signup')}>
              <Text style={{ color: colors.accent }} className="text-[13px] font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
