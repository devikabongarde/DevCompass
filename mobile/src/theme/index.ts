// DevCompass Premium Dark + Gold Theme 🔥
// Inspired by Zenzap's insane UI

export const colors = {
  // PRIMARY GOLD ACCENT 🌟
  primary: '#F5A623',        // Premium gold
  primaryDark: '#E09200',    // Darker gold
  primaryLight: '#FFD700',   // Bright gold

  // DARK BACKGROUNDS 🌑
  background: '#0A0A0A',           // Pure black
  backgroundSecondary: '#1A1A1A',  // Dark gray
  surface: '#1F1F1F',              // Card surface
  surfaceSecondary: '#2A2A2A',     // Lighter surface
  surfaceGlass: 'rgba(31, 31, 31, 0.7)', // Glassmorphism

  // TEXT COLORS ✨
  text: '#FFFFFF',              // Pure white
  textSecondary: '#B8B8B8',     // Light gray
  textLight: '#808080',         // Medium gray
  textDark: '#4A4A4A',          // Dark gray for light backgrounds

  // GOLD VARIATIONS 💛
  gold: '#F5A623',
  goldLight: '#FFD700',
  goldDark: '#E09200',
  goldGlow: 'rgba(245, 166, 35, 0.3)',

  // STATUS COLORS
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue

  // PLATFORM COLORS
  unstop: '#FF6B35',
  devpost: '#003E54',
  devfolio: '#6366F1',

  // UI ELEMENTS
  border: '#333333',
  borderLight: '#404040',
  borderGold: '#F5A623',
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.8)',

  // GRADIENTS 🌈
  gradientGold: ['#FFD700', '#F5A623', '#E09200'],
  gradientDark: ['#1A1A1A', '#0A0A0A'],
  gradientGlass: ['rgba(31, 31, 31, 0.9)', 'rgba(31, 31, 31, 0.6)'],
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 8,
  },
  gold: {
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
};

// Component-specific theme
export const components = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },

  cardGlass: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
    ...shadows.gold,
  },

  button: {
    primary: {
      backgroundColor: colors.gold,
      borderRadius: borderRadius.full,
      paddingVertical: 14,
      paddingHorizontal: 24,
      ...shadows.gold,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.full,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: colors.borderGold,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: borderRadius.full,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
  },

  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
};