// Design tokens for the LoveAgain booking platform
// Purpose: Create a distinctive visual identity that's not templated

export const colors = {
  // Primary palette
  primary: '#0A6EBD', // Deep teal - trustworthy, modern
  secondary: '#E67E22', // Warm orange - accent for CTAs
  success: '#10B981', // Emerald - for confirmed/completed states
  warning: '#F59E0B', // Amber - for pending/in-progress
  error: '#EF4444', // Red - for cancelled/disputed

  // Neutrals
  background: '#FAFAF9', // Off-white base
  surface: '#FFFFFF', // Card backgrounds
  surfaceSecondary: '#F8F9FA', // Secondary surfaces
  border: '#E7E3E0', // Border color
  textDark: '#111827', // Primary text
  textSecondary: '#6B7280', // Secondary text/placeholder
  textMuted: '#746B66', // Disabled/muted text

  // Status colors (specific to booking statuses)
  status: {
    pending: '#FEF3EE', // Light red for pending payment
    confirmed: '#F0F9F1', // Light green for confirmed
    inProgress: '#E8F4F8', // Light blue for in progress
    completed: '#F0F9F1', // Light green for completed
    cancelled: '#FDF2F2', // Light pink for cancelled
    disputed: '#FEF3EE', // Light red for disputed
  },

  // Status text colors
  statusText: {
    pending: '#C65D28',
    confirmed: '#378742',
    inProgress: '#2B8CB8',
    completed: '#378742',
    cancelled: '#D94A4A',
    disputed: '#C65D28',
  },
} as const;

export const typography = {
  // Font families
  family: {
    display: "'Inter', system-ui, -apple-system, sans-serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "ui-monospace, 'JetBrains Mono', 'Fira Code', monospace",
  },

  // Type scale (based on 16px base)
  scale: {
    h1: { size: 36, weight: 700, lineHeight: 1.1 },
    h2: { size: 28, weight: 600, lineHeight: 1.2 },
    h3: { size: 22, weight: 600, lineHeight: 1.3 },
    subtitle: { size: 18, weight: 600, lineHeight: 1.4 },
    body: { size: 16, weight: 400, lineHeight: 1.5 },
    caption: { size: 14, weight: 400, lineHeight: 1.4 },
    label: { size: 12, weight: 500, lineHeight: 1.4 },
  },
} as const;

export const spacing = {
  // 8-point grid system
  xs: 4, // 4px - smallest spacing (icon padding)
  sm: 8, // 8px - small gaps
  md: 12, // 12px - medium gaps
  lg: 16, // 16px - default gaps
  xl: 24, // 24px - section gaps
  xxl: 32, // 32px - large gaps
  xxxl: 48, // 48px - extra large
} as const;

export const radius = {
  sm: 6, // Small rounded corners
  md: 8, // Medium rounded corners
  lg: 12, // Large rounded corners
  full: 9999, // Full rounded (pill)
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;