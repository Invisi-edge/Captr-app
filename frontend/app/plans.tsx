import { premiumColors, radius, spacing } from '@/lib/premium-theme';
import { PLANS, PlanId } from '@/lib/plans';
import { useSubscription } from '@/lib/subscription-context';
import { useTheme } from '@/lib/theme-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Crown, Sparkles, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';

export default function PlansScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { plan: currentPlan, isPro } = useSubscription();
  const c = premiumColors(isDark);

  const [selectedPlan, setSelectedPlan] = useState<PlanId>(currentPlan === 'free' ? 'yearly' : currentPlan);

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
            Choose Your Plan
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={{ alignItems: 'center', paddingHorizontal: spacing['2xl'], paddingTop: spacing.xl, paddingBottom: spacing['2xl'] }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: c.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.lg,
            }}
          >
            <Crown size={28} color={c.accent} />
          </View>
          <Text style={{ fontSize: 26, fontWeight: '800', color: c.text, textAlign: 'center', letterSpacing: -0.5, marginBottom: 6 }}>
            Unlock Full Power
          </Text>
          <Text style={{ fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 280 }}>
            Unlimited scans, AI assistant, cloud sync, and more. Built for Indian professionals.
          </Text>
        </Animated.View>

        {/* Plans Cards */}
        {PLANS.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;
          const isCurrent = currentPlan === plan.id;
          const isHighlighted = plan.id === 'yearly';

          return (
            <Animated.View
              key={plan.id}
              entering={FadeInDown.delay(200 + index * 100).duration(600)}
              style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}
            >
              <PlanCard
                plan={plan}
                isSelected={isSelected}
                isCurrent={isCurrent}
                isHighlighted={isHighlighted}
                isPro={isPro}
                colors={c}
                onSelect={() => setSelectedPlan(plan.id)}
              />
            </Animated.View>
          );
        })}

        {/* Info note */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          style={{ paddingHorizontal: spacing['2xl'], marginTop: spacing.lg }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <Shield size={14} color={c.success} />
            <Text style={{ fontSize: 12, color: c.textSecondary, fontWeight: '600' }}>
              Pro Plans Launching Soon
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: c.textMuted, textAlign: 'center', lineHeight: 16 }}>
            Premium features are coming soon.{'\n'}
            You'll be notified when they become available.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Plan Card Component ─────────────────────────────────────────────────────

interface PlanCardProps {
  plan: (typeof PLANS)[number];
  isSelected: boolean;
  isCurrent: boolean;
  isHighlighted: boolean;
  isPro: boolean;
  colors: ReturnType<typeof premiumColors>;
  onSelect: () => void;
}

function PlanCard({ plan, isSelected, isCurrent, isHighlighted, isPro, colors: c, onSelect }: PlanCardProps) {

  const isFree = plan.id === 'free';
  const borderColor = isSelected
    ? isHighlighted
      ? '#10b981'
      : c.accent
    : c.cardBorderSubtle;

  return (
    <Pressable onPress={onSelect}>
      <View
        style={{
          backgroundColor: c.cardBg,
          borderRadius: radius['2xl'],
          borderWidth: isSelected ? 2 : 1,
          borderColor,
          padding: spacing.xl,
          ...c.shadow.md,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Badge */}
        {plan.badge && (
          <View
            style={{
              position: 'absolute',
              top: -1,
              right: 24,
              backgroundColor: '#10b981',
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderBottomLeftRadius: radius.lg,
              borderBottomRightRadius: radius.lg,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{plan.badge}</Text>
          </View>
        )}

        {/* Plan Name + Savings */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: c.textSecondary }}>{plan.name}</Text>
          {plan.savingsLabel && (
            <View
              style={{
                backgroundColor: '#10b98120',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: radius.md,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#10b981' }}>{plan.savingsLabel}</Text>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 }}>
          <Text style={{ fontSize: 38, fontWeight: '800', color: c.text, letterSpacing: -1.5 }}>
            {'\u20B9'}{plan.price}
          </Text>
          <Text style={{ fontSize: 14, color: c.textMuted, fontWeight: '500', marginLeft: 4 }}>
            /{plan.period}
          </Text>
        </View>

        {/* Description */}
        <Text style={{ fontSize: 12.5, color: c.textSecondary, marginBottom: 14, lineHeight: 18 }}>
          {plan.description}
        </Text>

        {/* Includes badge */}
        {plan.includes && (
          <View
            style={{
              backgroundColor: c.bgElevated,
              borderRadius: radius.lg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              alignSelf: 'flex-start',
              marginBottom: 14,
              borderWidth: 1,
              borderColor: c.cardBorderSubtle,
            }}
          >
            <Text style={{ fontSize: 11, color: c.textSecondary, fontWeight: '500' }}>{plan.includes}</Text>
          </View>
        )}

        {/* Features */}
        <View style={{ gap: 8, marginBottom: 18 }}>
          {plan.features.map((feature, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Check size={14} color={isHighlighted ? '#10b981' : c.accent} strokeWidth={3} />
              <Text style={{ fontSize: 13, color: c.text, fontWeight: '500', flex: 1 }}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        {isCurrent ? (
          <View
            style={{
              backgroundColor: c.bgElevated,
              borderRadius: radius.xl,
              paddingVertical: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: c.cardBorderSubtle,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.textSecondary }}>Current Plan</Text>
          </View>
        ) : isFree ? (
          <View
            style={{
              backgroundColor: c.bgElevated,
              borderRadius: radius.xl,
              paddingVertical: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: c.cardBorderSubtle,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.textSecondary }}>
              {isPro ? 'Included' : 'Start Free'}
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: isHighlighted ? '#10b98140' : `${c.accent}40`,
              borderRadius: radius.xl,
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <Sparkles size={16} color={isHighlighted ? '#10b981' : c.accent} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: isHighlighted ? '#10b981' : c.accent }}>
              Coming Soon
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
