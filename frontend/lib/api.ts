/**
 * API Configuration
 *
 * The backend URL is configured via EXPO_PUBLIC_BACKEND_URL environment variable.
 * In production this should point to your deployed backend (e.g. Railway).
 */

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://captr-app-production.up.railway.app';

/**
 * Simple fetch wrapper for API calls
 */
export async function apiRequest<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export { BACKEND_URL };
