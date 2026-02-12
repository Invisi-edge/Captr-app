/**
 * Subscription Plans Configuration
 *
 * Shared plan definitions for the Captr app (India-based pricing in INR).
 */

export type PlanId = 'free' | 'monthly' | 'yearly';

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // in INR (paise for Razorpay = price * 100)
  period: string;
  badge?: string;
  savingsLabel?: string;
  description: string;
  includes?: string;
  features: string[];
  limits: {
    scansPerMonth: number; // -1 = unlimited
    aiChat: boolean;
    exportExcel: boolean;
    exportCSV: boolean;
    cloudSync: boolean;
    prioritySupport: boolean;
    earlyAccess: boolean;
  };
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic features.',
    features: [
      '10 card scans per month',
      'Basic OCR extraction',
      'Export to CSV',
      'Local storage',
    ],
    limits: {
      scansPerMonth: 10,
      aiChat: false,
      exportExcel: false,
      exportCSV: true,
      cloudSync: false,
      prioritySupport: false,
      earlyAccess: false,
    },
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 299,
    period: 'month',
    description: 'Flexible monthly billing. Cancel anytime.',
    includes: 'Includes everything in Free',
    features: [
      'Unlimited card scans',
      'AI-powered OCR extraction',
      'Smart AI Assistant',
      'Export to Excel, CSV, vCard',
      'Cloud backup & sync',
      'Priority support',
    ],
    limits: {
      scansPerMonth: -1,
      aiChat: true,
      exportExcel: true,
      exportCSV: true,
      cloudSync: true,
      prioritySupport: true,
      earlyAccess: false,
    },
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 999,
    period: 'year',
    badge: 'Best Value',
    savingsLabel: 'Save 72%',
    description: 'Best value. Pay once, use all year.',
    includes: 'Includes everything in Monthly',
    features: [
      'Everything in Monthly',
      'Unlimited card scans',
      'AI-powered OCR extraction',
      'Smart AI Assistant',
      'Export to Excel, CSV, vCard',
      'Cloud backup & sync',
      'Early access to new features',
    ],
    limits: {
      scansPerMonth: -1,
      aiChat: true,
      exportExcel: true,
      exportCSV: true,
      cloudSync: true,
      prioritySupport: true,
      earlyAccess: true,
    },
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}

export function isPaidPlan(id: PlanId): boolean {
  return id === 'monthly' || id === 'yearly';
}
