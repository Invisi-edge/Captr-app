import { premiumColors, radius, spacing } from '@/lib/premium-theme';
import { useTheme } from '@/lib/theme-context';
import { useSubscription } from '@/lib/subscription-context';
import { BACKEND_URL } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { formatCurrency } from '@/lib/locale';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Receipt,
  Download,
  Crown,
  Calendar,
  CreditCard,
  CheckCircle,
  FileText,
  AlertCircle,
} from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';

interface Payment {
  id: string;
  plan: string;
  status: string;
  amount_paid: number;
  currency: string;
  order_id: string;
  payment_id: string;
  subscribed_at: string;
  expires_at: string;
  created_at: string;
}

export default function BillingScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { plan, isPro, expiresAt } = useSubscription();
  const c = premiumColors(isDark);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBilling = useCallback(async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/api/billing`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success) {
        setPayments(json.data);
      }
    } catch (error) {
      // Billing fetch error silenced for production
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBilling();
  }, [fetchBilling]);

  const downloadInvoice = async (paymentId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) {
        Alert.alert('Error', 'Please sign in to download invoice.');
        return;
      }

      const invoiceUrl = `${BACKEND_URL}/api/billing/${paymentId}/invoice?token=${encodeURIComponent(token)}`;

      if (Platform.OS === 'web') {
        // On web, open in new window for print/save as PDF
        Linking.openURL(invoiceUrl);
      } else {
        // On mobile, open in-app browser for print
        await WebBrowser.openBrowserAsync(invoiceUrl, {
          showInRecents: true,
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to open invoice. Please try again.');
    }
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateLong = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPlanLabel = (planId: string) => {
    switch (planId) {
      case 'yearly': return 'Yearly Pro';
      case 'monthly': return 'Monthly Pro';
      default: return 'Free';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(500)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.lg,
            backgroundColor: c.glassBg,
            borderWidth: 1,
            borderColor: c.glassBorder,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={18} color={c.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: c.text, letterSpacing: -0.3 }}>
            Billing & Invoices
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />
        }
      >
        {/* Current Plan Summary */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, marginBottom: spacing['2xl'] }}
        >
          <View
            style={{
              backgroundColor: isPro ? c.accentDark : c.cardBg,
              borderColor: isPro ? c.accent : c.cardBorder,
              borderWidth: 1,
              borderRadius: radius.xl,
              padding: spacing.xl,
              ...c.shadow.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.lg,
                  backgroundColor: isPro ? 'rgba(255,255,255,0.15)' : c.accentSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isPro ? <Crown size={20} color="#fff" /> : <CreditCard size={20} color={c.accent} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: isPro ? '#fff' : c.text }}>
                  {getPlanLabel(plan)}
                </Text>
                {isPro && expiresAt && (
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    {new Date(expiresAt) > new Date() ? 'Valid until' : 'Expired on'}{' '}
                    {formatDateLong(expiresAt)}
                  </Text>
                )}
                {!isPro && (
                  <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>
                    No active subscription
                  </Text>
                )}
              </View>
              <View
                style={{
                  backgroundColor: isPro ? 'rgba(16,185,129,0.25)' : c.bgSubtle,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: radius.full,
                  borderWidth: 1,
                  borderColor: isPro ? 'rgba(16,185,129,0.4)' : c.cardBorder,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: isPro ? '#10b981' : c.textMuted }}>
                  {isPro ? 'Active' : 'Free'}
                </Text>
              </View>
            </View>

            {!isPro && (
              <View
                style={{
                  backgroundColor: `${c.accent}20`,
                  borderRadius: radius.lg,
                  paddingVertical: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  borderWidth: 1,
                  borderColor: `${c.accent}40`,
                }}
              >
                <Crown size={16} color={c.accent} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.accent }}>Pro Plans Coming Soon</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Payment History Title */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.md }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Receipt size={14} color={c.textMuted} />
            <Text
              style={{
                color: c.textMuted,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              Payment History
            </Text>
          </View>
        </Animated.View>

        {/* Loading State */}
        {loading && (
          <View style={{ paddingVertical: spacing['4xl'], alignItems: 'center' }}>
            <ActivityIndicator size="small" color={c.accent} />
            <Text style={{ color: c.textMuted, fontSize: 13, marginTop: spacing.md }}>
              Loading billing history...
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && payments.length === 0 && (
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={{ alignItems: 'center', paddingVertical: spacing['4xl'], paddingHorizontal: spacing['2xl'] }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: c.bgSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xl,
                borderWidth: 1,
                borderColor: c.cardBorder,
              }}
            >
              <FileText size={28} color={c.textMuted} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 6 }}>
              No transactions yet
            </Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, textAlign: 'center', lineHeight: 19 }}>
              Your payment history and invoices will appear here after subscribing to a Pro plan.
            </Text>
          </Animated.View>
        )}

        {/* Payment Cards */}
        {payments.map((payment, index) => (
          <Animated.View
            key={payment.id}
            entering={FadeInDown.delay(300 + index * 80).duration(500)}
            style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.md }}
          >
            <View
              style={{
                backgroundColor: c.cardBg,
                borderColor: c.cardBorder,
                borderWidth: 1,
                borderRadius: radius.xl,
                overflow: 'hidden',
                ...c.shadow.sm,
              }}
            >
              {/* Card Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: spacing.lg,
                  paddingTop: spacing.lg,
                  paddingBottom: spacing.md,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: c.successSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle size={18} color={c.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>
                      {getPlanLabel(payment.plan)}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 1 }}>
                      {formatDateShort(payment.created_at || payment.subscribed_at)}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: c.text, letterSpacing: -0.5 }}>
                  {formatCurrency(payment.amount_paid)}
                </Text>
              </View>

              {/* Details Row */}
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: spacing.lg,
                  paddingBottom: spacing.md,
                  gap: spacing.xl,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Calendar size={11} color={c.textMuted} />
                  <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '500' }}>
                    {formatDateShort(payment.subscribed_at)} → {formatDateShort(payment.expires_at)}
                  </Text>
                </View>
              </View>

              {/* Payment IDs */}
              <View
                style={{
                  backgroundColor: c.bgSubtle,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm + 2,
                  gap: 2,
                }}
              >
                {payment.order_id && (
                  <Text style={{ fontSize: 10, color: c.textMuted, fontWeight: '500' }} numberOfLines={1}>
                    Order: {payment.order_id}
                  </Text>
                )}
                {payment.payment_id && (
                  <Text style={{ fontSize: 10, color: c.textMuted, fontWeight: '500' }} numberOfLines={1}>
                    Payment: {payment.payment_id}
                  </Text>
                )}
              </View>

              {/* Download Invoice Button */}
              <TouchableOpacity
                onPress={() => downloadInvoice(payment.id)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  borderTopWidth: 1,
                  borderTopColor: c.cardBorderSubtle,
                }}
              >
                <Download size={14} color={c.accent} strokeWidth={2.5} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: c.accent }}>
                  Download Invoice
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}

        {/* Info Note */}
        {payments.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(500).duration(600)}
            style={{
              paddingHorizontal: spacing.xl,
              marginTop: spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: c.bgSubtle,
                borderRadius: radius.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: c.cardBorderSubtle,
              }}
            >
              <AlertCircle size={14} color={c.textMuted} />
              <Text style={{ fontSize: 11, color: c.textMuted, flex: 1, lineHeight: 16 }}>
                Invoices are generated for all successful payments. Tap "Download Invoice" to save or print.
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
