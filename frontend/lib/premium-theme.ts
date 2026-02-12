/**
 * Premium Design System for Captr
 * Inspired by glassmorphism, gradient overlays, and modern UI patterns
 */

export const premiumColors = (isDark: boolean) => ({
  // Backgrounds
  bg: isDark ? '#06080f' : '#f8fafc',
  bgElevated: isDark ? '#0c1022' : '#ffffff',
  bgSubtle: isDark ? '#111631' : '#f1f5f9',

  // Cards
  cardBg: isDark ? '#0f1329' : '#ffffff',
  cardBgElevated: isDark ? '#151a35' : '#ffffff',
  cardBorder: isDark ? '#1c2347' : '#e2e8f0',
  cardBorderSubtle: isDark ? '#151c3a' : '#f1f5f9',

  // Glass effect (approximate for RN)
  glassBg: isDark ? 'rgba(15, 19, 41, 0.85)' : 'rgba(255, 255, 255, 0.85)',
  glassBorder: isDark ? 'rgba(28, 35, 71, 0.6)' : 'rgba(226, 232, 240, 0.6)',

  // Text
  text: isDark ? '#f1f5f9' : '#0f172a',
  textSecondary: isDark ? '#94a3b8' : '#64748b',
  textMuted: isDark ? '#64748b' : '#94a3b8',
  textInverse: isDark ? '#0f172a' : '#f1f5f9',

  // Accent (Refined Indigo)
  accent: '#818cf8',
  accentDark: '#6366f1',
  accentLight: '#a5b4fc',
  accentSoft: isDark ? 'rgba(129, 140, 248, 0.12)' : 'rgba(99, 102, 241, 0.08)',
  accentGlow: isDark ? 'rgba(129, 140, 248, 0.25)' : 'rgba(99, 102, 241, 0.15)',

  // Semantic Colors
  success: '#34d399',
  successSoft: isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(52, 211, 153, 0.08)',
  warning: '#fbbf24',
  warningSoft: isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(251, 191, 36, 0.08)',
  danger: '#f87171',
  dangerSoft: isDark ? 'rgba(248, 113, 113, 0.12)' : 'rgba(248, 113, 113, 0.08)',
  info: '#38bdf8',
  infoSoft: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(56, 189, 248, 0.08)',

  // Input
  inputBg: isDark ? '#0c1022' : '#f1f5f9',
  inputBorder: isDark ? '#1c2347' : '#e2e8f0',
  inputFocusBorder: isDark ? '#818cf8' : '#6366f1',

  // Gradient Pairs
  gradient: {
    primary: ['#6366f1', '#818cf8'] as [string, string],
    violet: ['#7c3aed', '#a78bfa'] as [string, string],
    cyan: ['#06b6d4', '#22d3ee'] as [string, string],
    emerald: ['#059669', '#34d399'] as [string, string],
    rose: ['#e11d48', '#fb7185'] as [string, string],
    amber: ['#d97706', '#fbbf24'] as [string, string],
  },

  // Shadows
  shadow: {
    sm: {
      shadowColor: isDark ? '#000' : '#64748b',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: isDark ? '#000' : '#64748b',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
    lg: {
      shadowColor: isDark ? '#000' : '#64748b',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.5 : 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    glow: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
    }),
  },

  // Avatar Colors
  avatarColors: [
    '#818cf8', // indigo
    '#38bdf8', // sky
    '#a78bfa', // violet
    '#34d399', // emerald
    '#fbbf24', // amber
    '#fb7185', // rose
    '#2dd4bf', // teal
    '#f472b6', // pink
  ] as string[],
});

/** Premium border radius values */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

/** Premium spacing scale */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};
