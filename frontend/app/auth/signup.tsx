import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, UserIcon } from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';
import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { premiumColors, radius, spacing } from '@/lib/premium-theme';

export default function SignUpScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const colors = premiumColors(isDark);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const errorCode = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : undefined;
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      const msg = errorCode === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : errorCode === 'auth/weak-password'
        ? 'Password is too weak'
        : errorCode === 'auth/invalid-email'
        ? 'Invalid email address'
        : errorMessage || 'Sign up failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage || 'Google sign up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Decorative background accent */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -100,
          left: -80,
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: colors.accentGlow,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ paddingTop: 16, paddingBottom: 36 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-start',
                paddingHorizontal: 14,
                paddingVertical: 10,
                gap: 6,
                backgroundColor: colors.glassBg,
                borderColor: colors.glassBorder,
                borderWidth: 1,
                borderRadius: radius.md,
                ...colors.shadow.sm,
              }}
            >
              <ArrowLeft size={16} color={colors.text} />
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 32,
                fontWeight: '800',
                letterSpacing: -0.8,
              }}
            >
              Create account
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                marginTop: 8,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Start scanning and organizing contacts
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <View
              style={{
                backgroundColor: colors.dangerSoft,
                borderColor: isDark ? 'rgba(248, 113, 113, 0.2)' : 'rgba(248, 113, 113, 0.15)',
                borderWidth: 1,
                borderRadius: radius.lg,
                paddingHorizontal: 18,
                paddingVertical: 14,
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.danger,
                }}
              />
              <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '500', flex: 1 }}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Name Input */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 8,
              }}
            >
              Name
            </Text>
            <Pressable
              onPress={() => nameRef.current?.focus()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.inputBg,
                borderRadius: radius.lg,
                paddingHorizontal: 16,
                borderWidth: 1.5,
                borderColor: nameFocused ? colors.inputFocusBorder : colors.inputBorder,
              }}
            >
              <UserIcon size={17} color={nameFocused ? colors.accent : colors.textMuted} />
              <TextInput
                ref={nameRef}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                style={{
                  color: colors.text,
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 15,
                  paddingVertical: 18,
                }}
                autoCorrect={false}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </Pressable>
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 8,
              }}
            >
              Email
            </Text>
            <Pressable
              onPress={() => emailRef.current?.focus()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.inputBg,
                borderRadius: radius.lg,
                paddingHorizontal: 16,
                borderWidth: 1.5,
                borderColor: emailFocused ? colors.inputFocusBorder : colors.inputBorder,
              }}
            >
              <Mail size={17} color={emailFocused ? colors.accent : colors.textMuted} />
              <TextInput
                ref={emailRef}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.textMuted}
                style={{
                  color: colors.text,
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 15,
                  paddingVertical: 18,
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </Pressable>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 8,
              }}
            >
              Password
            </Text>
            <Pressable
              onPress={() => passwordRef.current?.focus()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.inputBg,
                borderRadius: radius.lg,
                paddingHorizontal: 16,
                borderWidth: 1.5,
                borderColor: passwordFocused ? colors.inputFocusBorder : colors.inputBorder,
              }}
            >
              <Lock size={17} color={passwordFocused ? colors.accent : colors.textMuted} />
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                style={{
                  color: colors.text,
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 15,
                  paddingVertical: 18,
                }}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 4 }}
              >
                {showPassword ? (
                  <EyeOff size={17} color={colors.textMuted} />
                ) : (
                  <Eye size={17} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </Pressable>
          </View>

          {/* Confirm Password Input */}
          <View style={{ marginBottom: 28 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 8,
              }}
            >
              Confirm Password
            </Text>
            <Pressable
              onPress={() => confirmRef.current?.focus()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.inputBg,
                borderRadius: radius.lg,
                paddingHorizontal: 16,
                borderWidth: 1.5,
                borderColor: confirmFocused ? colors.inputFocusBorder : colors.inputBorder,
              }}
            >
              <Lock size={17} color={confirmFocused ? colors.accent : colors.textMuted} />
              <TextInput
                ref={confirmRef}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textMuted}
                style={{
                  color: colors.text,
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 15,
                  paddingVertical: 18,
                }}
                secureTextEntry={!showPassword}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
              />
            </Pressable>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.xl,
              paddingVertical: 20,
              backgroundColor: colors.accentDark,
              opacity: loading ? 0.7 : 1,
              ...colors.shadow.glow(colors.accent),
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 28,
              gap: 16,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: colors.cardBorder,
              }}
            />
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              or
            </Text>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: colors.cardBorder,
              }}
            />
          </View>

          {/* Google Sign Up */}
          <TouchableOpacity
            onPress={handleGoogleSignUp}
            disabled={googleLoading}
            activeOpacity={0.7}
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.xl,
              paddingVertical: 20,
              backgroundColor: colors.glassBg,
              borderColor: colors.glassBorder,
              borderWidth: 1,
              gap: 12,
              opacity: googleLoading ? 0.7 : 1,
              ...colors.shadow.sm,
            }}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                {/* Google G Logo */}
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    backgroundColor: '#ffffff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...colors.shadow.sm,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#4285F4',
                      marginTop: -1,
                    }}
                  >
                    G
                  </Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Switch to Sign In */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 36,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/signin')}>
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '700' }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
