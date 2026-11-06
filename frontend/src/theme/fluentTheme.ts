/**
 * Cue × Fluent 2 theme.
 *
 * Fluent 2 (https://fluent2.microsoft.design/) generates every brand-colored
 * token from a single 16-step ramp. Cue's ramp is anchored at brand[80] =
 * Bordeaux #881337 so the product stays recognisable while all neutrals,
 * shapes, type, elevation and motion follow Fluent 2 defaults.
 *
 * Source of truth for values: DESIGN.md. Keep the two in sync.
 */
import {
  createDarkTheme,
  createLightTheme,
  type BrandVariants,
  type Theme,
} from '@fluentui/react-components';

export const cueBrand: BrandVariants = {
  10: '#1A030A',
  20: '#290610',
  30: '#390817',
  40: '#490A1D',
  50: '#590C24',
  60: '#680F2A',
  70: '#781131',
  80: '#881337',
  90: '#9D3D5B',
  100: '#AD5D76',
  110: '#BC798E',
  120: '#C994A4',
  130: '#D6ADB9',
  140: '#E2C5CE',
  150: '#EEDCE2',
  160: '#F9F3F5',
};

export const cueLightTheme: Theme = {
  ...createLightTheme(cueBrand),
};

export const cueDarkTheme: Theme = {
  ...createDarkTheme(cueBrand),
  // Lift brand foregrounds in dark mode so links/icons keep ≥4.5:1 contrast.
  colorBrandForeground1: cueBrand[110],
  colorBrandForeground2: cueBrand[120],
  colorBrandForegroundLink: cueBrand[110],
  colorBrandForegroundLinkHover: cueBrand[120],
  colorCompoundBrandForeground1: cueBrand[110],
  colorCompoundBrandStroke: cueBrand[110],
  colorBrandStroke1: cueBrand[110],
};

export type ColorScheme = 'light' | 'dark';
