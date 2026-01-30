// DevCompare Theme Configuration

export const colors = {
  // Primary brand colors - Modern purple/indigo palette
  primary: '#6366f1',      // Indigo-500
  primaryDark: '#4f46e5',  // Indigo-600
  primaryLight: '#a5b4fc', // Indigo-300
  
  // Secondary colors
  secondary: '#f59e0b',    // Amber-500 for highlights
  secondaryLight: '#fbbf24', // Amber-400
  
  // Neutral colors
  background: '#ffffff',
  backgroundSecondary: '#f8fafc', // Slate-50
  surface: '#ffffff',
  surfaceSecondary: '#f1f5f9',   // Slate-100
  
  // Text colors
  text: '#0f172a',         // Slate-900
  textSecondary: '#64748b', // Slate-500
  textLight: '#94a3b8',    // Slate-400
  
  // Status colors
  success: '#10b981',      // Emerald-500
  warning: '#f59e0b',      // Amber-500
  error: '#ef4444',        // Red-500
  info: '#3b82f6',         // Blue-500
  
  // Platform colors
  unstop: '#ff6b35',       // Orange for Unstop
  devpost: '#003e54',      // Dark blue for Devpost
  devfolio: '#6366f1',     // Indigo for Devfolio
  
  // UI colors
  border: '#e2e8f0',       // Slate-200
  borderLight: '#f1f5f9',  // Slate-100
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Gradient colors
  gradientStart: '#6366f1',
  gradientEnd: '#8b5cf6',  // Violet-500
};

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Component-specific theme
export const components = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
    },
    secondary: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
  },
  
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.fontSize.base,
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