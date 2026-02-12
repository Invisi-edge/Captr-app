/**
 * API Configuration
 *
 * The backend URL is configured via EXPO_PUBLIC_BACKEND_URL environment variable.
 * In production this should point to your deployed backend (e.g. Railway).
 */

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://captr-app-production.up.railway.app';

export { BACKEND_URL };
