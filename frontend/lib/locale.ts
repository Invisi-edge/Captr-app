/**
 * Indian Locale Configuration
 *
 * Centralised locale settings for the app, targeting Indian users.
 */

/** BCP 47 locale tag for India */
export const LOCALE = 'en-IN';

/** Default country code for phone numbers */
export const DEFAULT_COUNTRY_CODE = '+91';

/** Date formatting helpers using Indian locale */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(LOCALE, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format an Indian phone number for display.
 * If the number is 10 digits, prepend +91.
 * Format: +91 XXXXX XXXXX
 */
export function formatIndianPhone(phone: string): string {
  if (!phone) return '';

  // Strip all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If it's a raw 10-digit Indian number, prepend +91
  if (/^\d{10}$/.test(cleaned)) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  // If it already starts with +91 and has 10 digits after
  const indiaMatch = cleaned.match(/^\+?91(\d{10})$/);
  if (indiaMatch) {
    const digits = indiaMatch[1];
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  // Return as-is for non-Indian numbers
  return phone;
}

/**
 * Format currency in Indian Rupees (INR).
 * Uses the Indian numbering system (lakhs, crores).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number using the Indian numbering system.
 * e.g. 1,00,000 instead of 100,000
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat(LOCALE).format(num);
}
