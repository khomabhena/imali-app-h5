// Imali App Color Scheme - Teal-based palette
// All colors are designed for financial clarity and accessibility

export const colors = {
  // Primary Brand Colors (Teal-based)
  primary: {
    50: '#f0fdfa',   // Lightest teal
    100: '#ccfbf1',  // Very light teal
    200: '#99f6e4',  // Light teal
    300: '#5eead4',  // Medium-light teal
    400: '#2dd4bf',  // Medium teal
    500: '#14b8a6',  // Base teal (primary brand color)
    600: '#0d9488',  // Medium-dark teal
    700: '#0f766e',  // Dark teal
    800: '#115e59',  // Very dark teal
    900: '#134e4a',  // Darkest teal
    950: '#042f2e',  // Almost black teal
  },

  // Bucket Colors (Teal-inspired palette)
  buckets: {
    Necessity: {
      main: '#0891b2',      // Cyan-teal (essential, trustworthy)
      light: '#06b6d4',     // Lighter variant
      dark: '#0e7490',      // Darker variant
      bg: '#ecfeff',        // Very light background
      border: '#22d3ee',    // Border color
    },
    Investment: {
      main: '#14b8a6',      // Primary teal (growth, investment)
      light: '#2dd4bf',     // Lighter variant
      dark: '#0d9488',      // Darker variant
      bg: '#f0fdfa',        // Very light background
      border: '#5eead4',    // Border color
    },
    Learning: {
      main: '#0ea5e9',      // Sky blue-teal (knowledge, learning)
      light: '#38bdf8',     // Lighter variant
      dark: '#0284c7',      // Darker variant
      bg: '#f0f9ff',        // Very light background
      border: '#7dd3fc',    // Border color
    },
    Emergency: {
      main: '#ef4444',      // Red (urgent, warning)
      light: '#f87171',     // Lighter variant
      dark: '#dc2626',      // Darker variant
      bg: '#fef2f2',        // Very light background
      border: '#fca5a5',    // Border color
    },
    Fun: {
      main: '#f59e0b',      // Amber (joy, fun)
      light: '#fbbf24',     // Lighter variant
      dark: '#d97706',      // Darker variant
      bg: '#fffbeb',        // Very light background
      border: '#fcd34d',    // Border color
    },
    Savings: {
      main: '#64748b',      // Slate gray (neutral, savings)
      light: '#94a3b8',     // Lighter variant
      dark: '#475569',      // Darker variant
      bg: '#f8fafc',        // Very light background
      border: '#cbd5e1',    // Border color
    },
  },

  // Semantic Colors
  semantic: {
    success: {
      main: '#10b981',      // Green (success, positive)
      light: '#34d399',
      dark: '#059669',
      bg: '#d1fae5',
    },
    warning: {
      main: '#f59e0b',      // Amber (warning, caution)
      light: '#fbbf24',
      dark: '#d97706',
      bg: '#fef3c7',
    },
    error: {
      main: '#ef4444',      // Red (error, blocked)
      light: '#f87171',
      dark: '#dc2626',
      bg: '#fee2e2',
    },
    info: {
      main: '#3b82f6',      // Blue (information)
      light: '#60a5fa',
      dark: '#2563eb',
      bg: '#dbeafe',
    },
  },

  // Neutral Colors
  neutral: {
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    black: '#000000',
  },

  // Background Colors
  background: {
    primary: '#ffffff',           // White (light mode)
    secondary: '#f9fafb',         // Light gray
    tertiary: '#f3f4f6',         // Lighter gray
    card: '#ffffff',              // Card background
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
  },

  // Text Colors
  text: {
    primary: '#111827',           // Almost black
    secondary: '#4b5563',         // Medium gray
    tertiary: '#6b7280',         // Light gray
    inverse: '#ffffff',           // White (for dark backgrounds)
    disabled: '#9ca3af',          // Disabled text
    positive: '#059669',          // Green for positive amounts
    negative: '#dc2626',          // Red for negative amounts
  },

  // Border Colors
  border: {
    default: '#e5e7eb',          // Light gray
    focus: '#14b8a6',             // Teal (focus state)
    error: '#ef4444',             // Red (error state)
    success: '#10b981',          // Green (success state)
  },

  // Mode Indicator Colors
  modes: {
    light: {
      main: '#10b981',            // Green (light mode)
      bg: '#d1fae5',
    },
    intermediate: {
      main: '#f59e0b',            // Amber (intermediate mode)
      bg: '#fef3c7',
    },
    strict: {
      main: '#ef4444',            // Red (strict mode)
      bg: '#fee2e2',
    },
  },
};

// Helper function to get bucket color
export const getBucketColor = (bucketName) => {
  return colors.buckets[bucketName] || colors.buckets.Savings;
};

// Helper function to get mode color
export const getModeColor = (mode) => {
  return colors.modes[mode] || colors.modes.intermediate;
};

// Export individual bucket colors for easy access
export const bucketColors = {
  Necessity: colors.buckets.Necessity.main,
  Investment: colors.buckets.Investment.main,
  Learning: colors.buckets.Learning.main,
  Emergency: colors.buckets.Emergency.main,
  Fun: colors.buckets.Fun.main,
  Savings: colors.buckets.Savings.main,
};

// Tailwind CSS color classes (for reference)
export const tailwindColors = {
  primary: {
    50: 'bg-teal-50',
    100: 'bg-teal-100',
    200: 'bg-teal-200',
    300: 'bg-teal-300',
    400: 'bg-teal-400',
    500: 'bg-teal-500',
    600: 'bg-teal-600',
    700: 'bg-teal-700',
    800: 'bg-teal-800',
    900: 'bg-teal-900',
  },
  buckets: {
    Necessity: {
      main: 'bg-cyan-600',
      light: 'bg-cyan-500',
      dark: 'bg-cyan-700',
      bg: 'bg-cyan-50',
      border: 'border-cyan-300',
    },
    Investment: {
      main: 'bg-teal-500',
      light: 'bg-teal-400',
      dark: 'bg-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-300',
    },
    Learning: {
      main: 'bg-sky-500',
      light: 'bg-sky-400',
      dark: 'bg-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-300',
    },
    Emergency: {
      main: 'bg-red-500',
      light: 'bg-red-400',
      dark: 'bg-red-600',
      bg: 'bg-red-50',
      border: 'border-red-300',
    },
    Fun: {
      main: 'bg-amber-500',
      light: 'bg-amber-400',
      dark: 'bg-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
    },
    Savings: {
      main: 'bg-slate-500',
      light: 'bg-slate-400',
      dark: 'bg-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-300',
    },
  },
};

export default colors;

