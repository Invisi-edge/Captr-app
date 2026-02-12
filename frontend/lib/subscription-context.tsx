import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { BACKEND_URL } from './api';
import { auth } from './firebase';
import { PlanId, getPlan } from './plans';

interface SubscriptionState {
  plan: PlanId;
  status: 'active' | 'expired' | 'pending';
  scansUsed: number;
  scansLimit: number; // -1 = unlimited
  expiresAt: string | null;
  subscribedAt: string | null;
  loading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  fetchSubscription: () => Promise<void>;
  canScan: () => boolean;
  canUseAI: () => boolean;
  canExportExcel: () => boolean;
  recordScan: () => Promise<boolean>;
  subscribe: (planId: 'monthly' | 'yearly') => Promise<boolean>;
  isPro: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: 'free',
  status: 'active',
  scansUsed: 0,
  scansLimit: 10,
  expiresAt: null,
  subscribedAt: null,
  loading: true,
  fetchSubscription: async () => {},
  canScan: () => true,
  canUseAI: () => false,
  canExportExcel: () => false,
  recordScan: async () => true,
  subscribe: async () => false,
  isPro: false,
});

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken(true);
      headers['Authorization'] = `Bearer ${token}`;
    } catch {
      // Fallback to cached token
      const token = await user.getIdToken(false);
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    status: 'active',
    scansUsed: 0,
    scansLimit: 10,
    expiresAt: null,
    subscribedAt: null,
    loading: true,
  });

  const fetchSubscription = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BACKEND_URL}/api/subscription`, { headers });
      const json = await res.json();

      if (json.success) {
        setState({
          plan: json.data.plan as PlanId,
          status: json.data.status,
          scansUsed: json.data.scansUsed,
          scansLimit: json.data.scansLimit,
          expiresAt: json.data.expiresAt,
          subscribedAt: json.data.subscribedAt,
          loading: false,
        });
      }
    } catch (error: unknown) {
      // Subscription fetch error silenced for production
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Fetch subscription when user is authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchSubscription();
      } else {
        setState({
          plan: 'free',
          status: 'active',
          scansUsed: 0,
          scansLimit: 10,
          expiresAt: null,
          subscribedAt: null,
          loading: false,
        });
      }
    });
    return unsubscribe;
  }, [fetchSubscription]);

  const canScan = useCallback(() => {
    if (state.scansLimit === -1) return true; // unlimited
    return state.scansUsed < state.scansLimit;
  }, [state.scansUsed, state.scansLimit]);

  const canUseAI = useCallback(() => {
    const plan = getPlan(state.plan);
    return plan.limits.aiChat;
  }, [state.plan]);

  const canExportExcel = useCallback(() => {
    const plan = getPlan(state.plan);
    return plan.limits.exportExcel;
  }, [state.plan]);

  const recordScan = useCallback(async (): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      headers['Content-Type'] = 'application/json';
      const res = await fetch(`${BACKEND_URL}/api/subscription/scan`, {
        method: 'POST',
        headers,
      });
      const json = await res.json();

      if (json.success) {
        setState((prev) => ({
          ...prev,
          scansUsed: json.scansUsed,
          scansLimit: json.scansLimit,
        }));
        return true;
      }

      if (json.error === 'scan_limit_reached') {
        Alert.alert(
          'Scan Limit Reached',
          json.message || 'Upgrade to a paid plan for unlimited scans.',
          [{ text: 'OK' }],
        );
        return false;
      }

      return false;
    } catch (error: unknown) {
      // Record scan error silenced for production
      return true; // Allow scan on network error to not block UX
    }
  }, []);

  const subscribe = useCallback(async (_planId: 'monthly' | 'yearly'): Promise<boolean> => {
    // Payments are temporarily disabled for initial Play Store release.
    // Will be re-enabled with Google Play Billing in a future update.
    Alert.alert(
      'Coming Soon',
      'Pro plans are launching soon! You will be notified when premium features become available.',
      [{ text: 'OK' }],
    );
    return false;
  }, []);

  const isPro = state.plan === 'monthly' || state.plan === 'yearly';

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        fetchSubscription,
        canScan,
        canUseAI,
        canExportExcel,
        recordScan,
        subscribe,
        isPro,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
