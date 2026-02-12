import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/lib/subscription-context';
import { premiumColors, radius, spacing } from '@/lib/premium-theme';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  LogOut,
  Shield,
  Moon,
  HelpCircle,
  Check,
  X,
  Crown,
  Zap,
  Receipt,
  FileText,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, signOut, updateUserProfile, changePassword } = useAuth();
  const { plan, isPro, scansUsed, scansLimit, expiresAt, subscribedAt } = useSubscription();

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  const colors = premiumColors(isDark);

  const handleSignOut = () => {
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
  };

  const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: spacing['2xl'], paddingTop: spacing['2xl'], paddingBottom: spacing.xl }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 28,
              fontWeight: '800',
              letterSpacing: -0.7,
            }}
          >
            Settings
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              marginTop: spacing.xs,
              fontWeight: '500',
            }}
          >
            Manage your account and preferences
          </Text>
        </View>

        {/* Profile Card */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] }}>
          <View
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              borderRadius: radius.xl,
              padding: spacing.xl,
              ...colors.shadow.md,
            }}
          >
            {/* Subtle accent strip at top */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: spacing['2xl'],
                right: spacing['2xl'],
                height: 3,
                borderRadius: 2,
                backgroundColor: colors.accent,
                opacity: 0.5,
              }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.accentDark,
                  marginRight: spacing.lg,
                  borderWidth: 2,
                  borderColor: colors.accent,
                  ...colors.shadow.glow(colors.accent),
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#ffffff' }}>
                  {(user?.displayName || user?.email || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: '800',
                    letterSpacing: -0.3,
                  }}
                  numberOfLines={1}
                >
                  {user?.displayName || 'No name set'}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                    marginTop: 2,
                    fontWeight: '500',
                  }}
                  numberOfLines={1}
                >
                  {user?.email}
                </Text>
                {isGoogleUser && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <View
                      style={{
                        backgroundColor: isDark ? 'rgba(66, 133, 244, 0.15)' : 'rgba(66, 133, 244, 0.1)',
                        paddingHorizontal: spacing.md,
                        paddingVertical: 3,
                        borderRadius: radius.full,
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(66, 133, 244, 0.25)' : 'rgba(66, 133, 244, 0.15)',
                      }}
                    >
                      <Text style={{ color: '#4285f4', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 }}>
                        Google Account
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Subscription Card */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] }}>
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
            Subscription
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/plans')}
            activeOpacity={0.85}
            style={{
              backgroundColor: isPro ? colors.accentDark : colors.cardBg,
              borderColor: isPro ? colors.accent : colors.cardBorder,
              borderWidth: 1,
              borderRadius: radius.xl,
              padding: spacing.xl,
              ...colors.shadow.md,
            }}
          >
            {/* Plan header row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isPro ? 14 : 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: isPro ? 'rgba(255,255,255,0.15)' : colors.accentSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                {isPro ? <Crown size={18} color="#fff" /> : <Zap size={18} color={colors.accent} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: isPro ? '#fff' : colors.text }}>
                  {plan === 'yearly' ? 'Yearly Pro' : plan === 'monthly' ? 'Monthly Pro' : 'Free Plan'}
                </Text>
                {!isPro && (
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                    {scansUsed}/{scansLimit} scans used this month
                  </Text>
                )}
              </View>
              <View
                style={{
                  backgroundColor: isPro ? 'rgba(16,185,129,0.25)' : colors.accentSoft,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: radius.full,
                  borderWidth: 1,
                  borderColor: isPro ? 'rgba(16,185,129,0.4)' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: isPro ? '#10b981' : colors.accent,
                  }}
                >
                  {isPro ? 'Active' : 'Upgrade'}
                </Text>
              </View>
            </View>

            {/* Pro details: expiry, subscribed since, features */}
            {isPro && (
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  gap: 8,
                }}
              >
                {expiresAt && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: new Date(expiresAt) > new Date() ? '#10b981' : '#f87171',
                      }}
                    />
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
                      {new Date(expiresAt) > new Date() ? 'Valid until' : 'Expired on'}{' '}
                      {new Date(expiresAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                )}
                {subscribedAt && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
                      Subscribed on{' '}
                      {new Date(subscribedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {['Unlimited Scans', 'AI Chat', 'Excel Export', 'Cloud Sync'].map((feature) => (
                    <View
                      key={feature}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: radius.md,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>
                        ✓ {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Free user: coming soon CTA */}
            {!isPro && (
              <View
                style={{
                  backgroundColor: colors.accentSoft,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Zap size={14} color={colors.accent} />
                <Text style={{ fontSize: 12, color: colors.accent, fontWeight: '600', flex: 1 }}>
                  Pro plans coming soon — unlimited scans, AI chat & more
                </Text>
                <ChevronRight size={14} color={colors.accent} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] }}>
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
            Account
          </Text>

          <View
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              borderRadius: radius.xl,
              overflow: 'hidden',
              ...colors.shadow.sm,
            }}
          >
            <SettingsRow
              icon={<User size={18} color={colors.accent} />}
              iconBg={colors.accentSoft}
              iconAccent={colors.accent}
              title="Edit Profile"
              subtitle="Change your display name"
              onPress={() => setEditProfileVisible(true)}
              colors={colors}
              isDark={isDark}
            />
            {!isGoogleUser && (
              <SettingsRow
                icon={<Lock size={18} color={colors.warning} />}
                iconBg={colors.warningSoft}
                iconAccent={colors.warning}
                title="Change Password"
                subtitle="Update your password"
                onPress={() => setChangePasswordVisible(true)}
                colors={colors}
                isDark={isDark}
                showBorder
              />
            )}
            <SettingsRow
              icon={<Mail size={18} color={colors.info} />}
              iconBg={colors.infoSoft}
              iconAccent={colors.info}
              title="Email"
              subtitle={user?.email || 'Not set'}
              colors={colors}
              isDark={isDark}
              showBorder={!isGoogleUser}
              disabled
            />
            <SettingsRow
              icon={<Receipt size={18} color={colors.success} />}
              iconBg={colors.successSoft}
              iconAccent={colors.success}
              title="Billing & Invoices"
              subtitle={isPro ? 'View payments & download invoices' : 'No payments yet'}
              onPress={() => router.push('/billing')}
              colors={colors}
              isDark={isDark}
              showBorder
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] }}>
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
            Preferences
          </Text>

          <View
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              borderRadius: radius.xl,
              overflow: 'hidden',
              ...colors.shadow.sm,
            }}
          >
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.lg,
              }}
            >
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.08)',
                  width: 40,
                  height: 40,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.lg,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.12)',
                }}
              >
                <Moon size={18} color="#8b5cf6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
                  Dark Mode
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2, fontWeight: '500' }}>
                  {isDark ? 'Currently enabled' : 'Currently disabled'}
                </Text>
              </View>
              {/* Premium toggle */}
              <View
                style={{
                  backgroundColor: isDark ? colors.accentDark : colors.inputBg,
                  width: 52,
                  height: 30,
                  borderRadius: 15,
                  padding: 3,
                  borderWidth: 1,
                  borderColor: isDark ? colors.accent : colors.inputBorder,
                  ...(isDark ? colors.shadow.glow(colors.accent) : {}),
                }}
              >
                <View
                  style={{
                    backgroundColor: '#ffffff',
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    marginLeft: isDark ? 22 : 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] }}>
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
            Support
          </Text>

          <View
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              borderRadius: radius.xl,
              overflow: 'hidden',
              ...colors.shadow.sm,
            }}
          >
            <SettingsRow
              icon={<HelpCircle size={18} color={colors.success} />}
              iconBg={colors.successSoft}
              iconAccent={colors.success}
              title="Help & FAQ"
              subtitle="Get help using Captr"
              onPress={() => Alert.alert('Help', 'Contact support@captr.app for assistance.')}
              colors={colors}
              isDark={isDark}
            />
            <SettingsRow
              icon={<Shield size={18} color={colors.info} />}
              iconBg={colors.infoSoft}
              iconAccent={colors.info}
              title="Privacy Policy"
              subtitle="How we handle your data"
              onPress={() => router.push('/privacy-policy')}
              colors={colors}
              isDark={isDark}
              showBorder
            />
            <SettingsRow
              icon={<FileText size={18} color={colors.warning} />}
              iconBg={colors.warningSoft}
              iconAccent={colors.warning}
              title="Terms of Service"
              subtitle="Rules and conditions of use"
              onPress={() => router.push('/terms-of-service')}
              colors={colors}
              isDark={isDark}
              showBorder
            />
          </View>
        </View>

        {/* Sign Out */}
        <View style={{ paddingHorizontal: spacing['2xl'] }}>
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.xl,
              paddingVertical: 16,
              backgroundColor: colors.dangerSoft,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(248, 113, 113, 0.2)' : 'rgba(248, 113, 113, 0.15)',
              ...colors.shadow.glow(colors.danger),
            }}
          >
            <LogOut size={18} color={colors.danger} />
            <Text
              style={{
                color: colors.danger,
                fontSize: 15,
                fontWeight: '700',
                marginLeft: spacing.sm,
              }}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginTop: spacing['3xl'] }}>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 11,
              textAlign: 'center',
              fontWeight: '500',
            }}
          >
            Captr v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editProfileVisible}
        onClose={() => setEditProfileVisible(false)}
        colors={colors}
        isDark={isDark}
        currentName={user?.displayName || ''}
        onSave={updateUserProfile}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
        colors={colors}
        isDark={isDark}
        onSave={changePassword}
      />
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  iconBg,
  iconAccent,
  title,
  subtitle,
  onPress,
  colors,
  isDark,
  showBorder,
  disabled,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconAccent: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  colors: ReturnType<typeof premiumColors>;
  isDark: boolean;
  showBorder?: boolean;
  disabled?: boolean;
}) {
  const Wrapper = disabled ? View : TouchableOpacity;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        borderTopWidth: showBorder ? 1 : 0,
        borderTopColor: colors.cardBorderSubtle,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
      }}
    >
      <View
        style={{
          backgroundColor: iconBg,
          width: 40,
          height: 40,
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
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
          {title}
        </Text>
        <Text
          style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2, fontWeight: '500' }}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      {!disabled && <ChevronRight size={16} color={colors.textMuted} />}
    </Wrapper>
  );
}

function EditProfileModal({
  visible,
  onClose,
  colors,
  isDark,
  currentName,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  colors: ReturnType<typeof premiumColors>;
  isDark: boolean;
  currentName: string;
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    setLoading(true);
    try {
      await onSave(name.trim());
      Alert.alert('Success', 'Profile updated successfully');
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      Alert.alert('Error', errorMessage || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onClose}
          />
          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderTopLeftRadius: radius['3xl'],
              borderTopRightRadius: radius['3xl'],
              paddingHorizontal: spacing['2xl'],
              paddingTop: spacing.lg,
              paddingBottom: spacing['4xl'],
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: colors.cardBorder,
              ...colors.shadow.lg,
            }}
          >
            {/* Handle */}
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <View
                style={{
                  backgroundColor: colors.cardBorder,
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing['2xl'],
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 22,
                  fontWeight: '800',
                  letterSpacing: -0.5,
                }}
              >
                Edit Profile
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.bgSubtle,
                }}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: colors.textMuted,
                fontSize: 10,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: spacing.sm,
              }}
            >
              Display Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.lg,
                paddingVertical: 16,
                fontSize: 15,
                fontWeight: '500',
                marginBottom: spacing['2xl'],
                borderWidth: 1,
                borderColor: colors.inputBorder,
              }}
              autoFocus
            />

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.xl,
                paddingVertical: 16,
                backgroundColor: colors.accentDark,
                opacity: loading ? 0.7 : 1,
                ...colors.shadow.glow(colors.accent),
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check size={18} color="#fff" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#ffffff',
                      marginLeft: spacing.sm,
                    }}
                  >
                    Save Changes
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ChangePasswordModal({
  visible,
  onClose,
  colors,
  isDark,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  colors: ReturnType<typeof premiumColors>;
  isDark: boolean;
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await onSave(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: unknown) {
      const errorCode = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : undefined;
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      const msg =
        errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential'
          ? 'Current password is incorrect'
          : errorMessage || 'Failed to change password';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const inputStyle = {
    backgroundColor: colors.inputBg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={handleClose}
          />
          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderTopLeftRadius: radius['3xl'],
              borderTopRightRadius: radius['3xl'],
              paddingHorizontal: spacing['2xl'],
              paddingTop: spacing.lg,
              paddingBottom: spacing['4xl'],
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: colors.cardBorder,
              ...colors.shadow.lg,
            }}
          >
            {/* Handle */}
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <View
                style={{
                  backgroundColor: colors.cardBorder,
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing['2xl'],
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 22,
                  fontWeight: '800',
                  letterSpacing: -0.5,
                }}
              >
                Change Password
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.bgSubtle,
                }}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Current Password */}
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 10,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: spacing.sm,
              }}
            >
              Current Password
            </Text>
            <View
              style={{
                ...inputStyle,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.lg,
              }}
            >
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={colors.textMuted}
                style={{ color: colors.text, flex: 1, paddingVertical: 14, fontSize: 14, fontWeight: '500' }}
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? (
                  <EyeOff size={18} color={colors.textMuted} />
                ) : (
                  <Eye size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 10,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: spacing.sm,
              }}
            >
              New Password
            </Text>
            <View
              style={{
                ...inputStyle,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.lg,
              }}
            >
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={colors.textMuted}
                style={{ color: colors.text, flex: 1, paddingVertical: 14, fontSize: 14, fontWeight: '500' }}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                {showNew ? (
                  <EyeOff size={18} color={colors.textMuted} />
                ) : (
                  <Eye size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 10,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: spacing.sm,
              }}
            >
              Confirm New Password
            </Text>
            <View
              style={{
                ...inputStyle,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing['2xl'],
              }}
            >
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textMuted}
                style={{ color: colors.text, flex: 1, paddingVertical: 14, fontSize: 14, fontWeight: '500' }}
                secureTextEntry={!showNew}
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.xl,
                paddingVertical: 16,
                backgroundColor: colors.accentDark,
                opacity: loading ? 0.7 : 1,
                ...colors.shadow.glow(colors.accent),
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Lock size={18} color="#fff" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#ffffff',
                      marginLeft: spacing.sm,
                    }}
                  >
                    Update Password
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
