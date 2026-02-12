import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
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
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
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
      console.error('Fetch subscription error:', error);
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
      console.error('Record scan error:', error);
      return true; // Allow scan on network error to not block UX
    }
  }, []);

  const subscribe = useCallback(async (planId: 'monthly' | 'yearly'): Promise<boolean> => {
    try {
      // Ensure user is logged in
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Not Signed In', 'Please sign in to subscribe.');
        return false;
      }

      let token: string;
      try {
        token = await user.getIdToken(true); // force refresh
      } catch {
        Alert.alert('Auth Error', 'Could not authenticate. Please sign out and sign in again.');
        return false;
      }

      // Step 1: Create order on backend
      const orderRes = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });
      const orderJson = await orderRes.json();

      if (!orderJson.success) {
        Alert.alert('Error', orderJson.error || 'Failed to create order');
        return false;
      }

      const { orderId, amount } = orderJson.data;

      // Step 2: Build checkout URL with query params (including auth token for server-side verification)
      const checkoutParams = new URLSearchParams({
        order_id: orderId,
        amount: String(amount),
        plan_name: orderJson.data.planName,
        plan_id: planId,
        email: user?.email || '',
        name: user?.displayName || '',
        token: token || '',
      });

      const checkoutUrl = `${BACKEND_URL}/api/payments/checkout?${checkoutParams.toString()}`;

      // Step 4: Open Razorpay checkout in browser.
      // Use openBrowserAsync (works reliably on Android + Expo Go).
      // The checkout page will redirect to our callback URL after payment,
      // which re-opens the app via deep link.
      await WebBrowser.openBrowserAsync(checkoutUrl, {
        showInRecents: true,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });

      // Step 5: When user returns to the app (after payment or cancel),
      // poll the subscription multiple times to catch payment verification.
      // The backend checkout page auto-verifies via the callback URL.
      const pollDelays = [1500, 2500, 4000, 6000]; // progressive polling
      for (const delay of pollDelays) {
        await new Promise((resolve) => setTimeout(resolve, delay));

        try {
          const freshToken = await auth.currentUser?.getIdToken(true);
          const checkRes = await fetch(`${BACKEND_URL}/api/subscription`, {
            headers: { 'Authorization': `Bearer ${freshToken}` },
          });
          const checkJson = await checkRes.json();

          if (checkJson.success && (checkJson.data.plan === 'monthly' || checkJson.data.plan === 'yearly')) {
            // Payment verified! Update state immediately
            setState({
              plan: checkJson.data.plan as PlanId,
              status: checkJson.data.status,
              scansUsed: checkJson.data.scansUsed,
              scansLimit: checkJson.data.scansLimit,
              expiresAt: checkJson.data.expiresAt,
              subscribedAt: checkJson.data.subscribedAt,
              loading: false,
            });

            const planLabel = checkJson.data.plan === 'yearly' ? 'Yearly' : 'Monthly';
            const expiryMsg = checkJson.data.expiresAt
              ? `\nValid until ${new Date(checkJson.data.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : '';

            Alert.alert(
              'Payment Successful! 🎉',
              `Your ${planLabel} Pro plan is now active. Enjoy unlimited scans, AI chat, and more!${expiryMsg}`,
              [{ text: 'Great!' }],
            );
            return true;
          }
        } catch {
          // Polling error, continue to next attempt
        }
      }

      // After all polls, do a final refresh and return false
      await fetchSubscription();
      return false;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      console.error('Subscribe error:', error);
      Alert.alert('Payment Error', message || 'Something went wrong. Please try again.');
      return false;
    }
  }, [fetchSubscription]);

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
