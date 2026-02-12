import React, { createContext, useContext } from 'react';
import { PlanId } from './plans';

/**
 * Subscription context - All features are currently free and unlimited.
 */

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

// All features unlocked - free unlimited access
const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: 'yearly', // Treat as pro plan
  status: 'active',
  scansUsed: 0,
  scansLimit: -1, // Unlimited
  expiresAt: null,
  subscribedAt: null,
  loading: false,
  fetchSubscription: async () => {},
  canScan: () => true,
  canUseAI: () => true,
  canExportExcel: () => true,
  recordScan: async () => true,
  subscribe: async () => true,
  isPro: true,
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  // All features are free and unlimited - no backend calls needed
  const value: SubscriptionContextType = {
    plan: 'yearly',
    status: 'active',
    scansUsed: 0,
    scansLimit: -1, // Unlimited
    expiresAt: null,
    subscribedAt: null,
    loading: false,
    fetchSubscription: async () => {}, // No-op
    canScan: () => true,
    canUseAI: () => true,
    canExportExcel: () => true,
    recordScan: async () => true, // Always allow
    subscribe: async () => true, // No-op, already "pro"
    isPro: true,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
