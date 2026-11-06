---
# gstack: design-md-format=spec
name: Cue
description: Cue on Microsoft Fluent 2 — calm, accessible, platform-native UI with a Bordeaux brand ramp.
system: Fluent 2 (https://fluent2.microsoft.design/)
colors:
  brand-ramp:
    "10": "#1A030A"
    "20": "#290610"
    "30": "#390817"
    "40": "#490A1D"
    "50": "#590C24"
    "60": "#680F2A"
    "70": "#781131"
    "80": "#881337"
    "90": "#9D3D5B"
    "100": "#AD5D76"
    "110": "#BC798E"
    "120": "#C994A4"
    "130": "#D6ADB9"
    "140": "#E2C5CE"
    "150": "#EEDCE2"
    "160": "#F9F3F5"
  light:
    background: "#FAFAFA"        # colorNeutralBackground2
    surface: "#FFFFFF"           # colorNeutralBackground1
    surface-muted: "#F5F5F5"     # colorNeutralBackground3
    text: "#242424"              # colorNeutralForeground1
    text-secondary: "#424242"    # colorNeutralForeground2
    text-muted: "#616161"        # colorNeutralForeground3
    text-disabled: "#BDBDBD"
    stroke: "#E0E0E0"            # colorNeutralStroke2
    stroke-strong: "#D1D1D1"     # colorNeutralStroke1
    brand-background: "#881337"  # brand 80
    brand-background-hover: "#781131"   # brand 70
    brand-background-pressed: "#490A1D" # brand 40
    brand-background-2: "#F9F3F5"       # brand 160
    brand-foreground: "#881337"
    focus-stroke: "#000000"
    success: "#107C10"
    warning: "#BC4B09"
    danger: "#C50F1F"
    trust: "#6C5700"             # Fluent gold shade30
  dark:
    background: "#1F1F1F"
    surface: "#292929"
    surface-muted: "#333333"
    text: "#FFFFFF"
    text-muted: "#ADADAD"
    stroke: "#3D3D3D"
    stroke-strong: "#666666"
    brand-background: "#781131"  # brand 70
    brand-background-hover: "#881337"
    brand-foreground: "#BC798E"  # brand 110
    focus-stroke: "#FFFFFF"
    success: "#54B054"
    warning: "#FAA06B"
    danger: "#DC626D"
    trust: "#E3C34F"
typography:
  fontFamily: "'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif"
  monoFamily: "Consolas, 'Cascadia Mono', ui-monospace, Menlo, monospace"
  numeric: "font-variant-numeric: tabular-nums"
  web-ramp:
    caption2: "10/14 regular"
    caption1: "12/16 regular|semibold"
    body1: "14/20 regular|semibold"   # default body
    body2: "16/22 regular"
    subtitle2: "16/22 semibold"
    subtitle1: "20/28 semibold"
    title3: "24/32 semibold"
    title2: "28/36 semibold"
    title1: "32/40 semibold"
    largeTitle: "40/52 semibold"
    display: "68/92 semibold"
  mobile-ramp:
    caption2: "12/16 regular"
    caption1: "13/18 regular|semibold"
    body2: "15/20 regular|semibold"
    body1: "17/22 regular|semibold"
    title3: "20/25 semibold"
    title2: "22/28 semibold"
    title1: "28/34 semibold"
    largeTitle: "34/40 semibold"
rounded:
  web:
    none: "0"
    small: "2px"
    medium: "4px"     # buttons, inputs, menus
    large: "6px"
    xLarge: "8px"     # cards, dialogs, popovers
    circular: "9999px"
  mobile:
    medium: "4px"     # checkboxes, small badges
    large: "8px"      # buttons, inputs, chips
    xLarge: "12px"    # cards, sheets, dialogs
    circular: "9999px"
spacing:
  xxs: "2px"
  xs: "4px"
  sNudge: "6px"
  s: "8px"
  mNudge: "10px"
  m: "12px"
  l: "16px"
  xl: "20px"
  xxl: "24px"
  xxxl: "32px"
elevation:
  shadow2: "0 0 2px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.14)"
  shadow4: "0 0 2px rgba(0,0,0,.12), 0 2px 4px rgba(0,0,0,.14)"
  shadow8: "0 0 2px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.14)"
  shadow16: "0 0 2px rgba(0,0,0,.12), 0 8px 16px rgba(0,0,0,.14)"
  shadow28: "0 0 8px rgba(0,0,0,.12), 0 14px 28px rgba(0,0,0,.14)"
  shadow64: "0 0 8px rgba(0,0,0,.12), 0 32px 64px rgba(0,0,0,.14)"
motion:
  durationFast: "150ms"
  durationNormal: "200ms"
  durationSlow: "300ms"
  curveEasyEase: "cubic-bezier(0.33, 0, 0.67, 1)"
  curveDecelerateMid: "cubic-bezier(0, 0, 0, 1)"
  curveAccelerateMid: "cubic-bezier(1, 0, 1, 1)"
components:
  button-primary:
    backgroundColor: "{colors.light.brand-background}"
    textColor: "#FFFFFF"
    rounded: "{rounded.web.medium}"
    height: "32px (medium) / 40px (large, default for primary CTAs)"
  button-secondary:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.text}"
    borderColor: "{colors.light.stroke-strong}"
    rounded: "{rounded.web.medium}"
  card:
    backgroundColor: "{colors.light.surface}"
    rounded: "{rounded.web.xLarge}"
    shadow: "{elevation.shadow4}"
    hoverShadow: "{elevation.shadow8}"
  dialog:
    rounded: "{rounded.web.xLarge}"
    shadow: "{elevation.shadow64}"
  input:
    borderColor: "{colors.light.stroke-strong}"
    bottomBorder: "colorNeutralStrokeAccessible #616161; brand 2px underline on focus"
    rounded: "{rounded.web.medium}"
  trust-badge:
    backgroundColor: "#FBF6D9"
    textColor: "{colors.light.trust}"
    borderColor: "#E8D88A"
---

# Cue Design System — Fluent 2

## Overview

Cue adopts **Microsoft Fluent 2** ([fluent2.microsoft.design](https://fluent2.microsoft.design/)) on web and mobile. Fluent's principles drive every decision:

- **Natural on every device** — the platform's own type (Segoe UI / SF Pro / Roboto), native interaction patterns, and touch-first sizes on mobile.
- **Built for focus** — calm neutral surfaces, one brand color used sparingly for primary actions and selection, clear hierarchy through the type ramp rather than decoration.
- **One for all** — WCAG 2.1 AA contrast, visible 2px focus strokes, 44×44px minimum touch targets, reduced-motion support.
- **Unmistakably Cue** — the brand ramp is generated from Cue Bordeaux `#881337` (brand 80), so the product keeps its identity inside the Fluent system.

**Product context:** Cue is an identity-verified, escrow-backed platonic companionship marketplace in India's metros (Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Pune, Chennai).

## Implementation

| Platform | Where | How |
| --- | --- | --- |
| Web (React) | `frontend/src/theme/fluentTheme.ts` | `@fluentui/react-components` v9 `createLightTheme`/`createDarkTheme` from the Cue brand ramp; `<ThemeProvider>` wraps the app in `FluentProvider` and handles light / dark / system. |
| Web (layout) | `frontend/src/index.css` | Tailwind v4 semantic tokens (`bg-card`, `text-muted-foreground`, `bg-accent`, `text-brand-fg`, `bg-trust-light` …) mapped to Fluent values. Tailwind's radius, shadow and text scales are snapped to Fluent ramps; `text-body1`, `text-title3` etc. are available. |
| Mobile (Flutter) | `mobile/lib/core/theme.dart` | Material 3 `ThemeData` mapped to Fluent 2 mobile tokens: `FluentBrand`, `FluentType`, `FluentRadius`, `FluentSpacing`, `FluentShadows`, `FluentMotion`, and the semantic `AppColors`. |

**Web component rule:** interactive controls (Button, Input, Textarea, Dropdown/Combobox, Checkbox, Switch, Radio, Dialog, Drawer, Menu, Popover, Tooltip, Tabs/TabList, Badge, Avatar, Spinner, MessageBar, Toast, Card) come from `@fluentui/react-components`. Tailwind is for layout (flex/grid, spacing, responsive breakpoints) and for semantic color tokens. Icons come from `@fluentui/react-icons` (Regular for rest, Filled for selected).

## Color

- **Neutrals carry the UI.** Backgrounds use the Fluent grey ramp; text uses Foreground 1/2/3. Do not tint surfaces with brand color.
- **Brand (Bordeaux ramp) is for:** primary buttons, selected states, links, focus underline on inputs, and the active nav item. One primary button per view.
- **Brand text on neutral surfaces** uses `brand-fg` (brand 80 light / brand 110 dark), never the button background token.
- **Status:** success `#107C10`, warning `#BC4B09`, danger `#C50F1F` (and their Background1 tints). Escrow states map to these.
- **Trust signal:** verified badges, ratings and escrow guarantees use the Fluent shared gold palette (`trust`, `trust-light`, `trust-border`), sparingly.
- **Themes:** Light and Dark only (plus "follow system"). The six legacy palettes (romantic, emerald, champagne, sapphire …) are retired; saved preferences map to light/dark.

## Typography

- Single family: the Fluent font stack (platform UI font). No web fonts are loaded.
- Use the type ramp, not ad-hoc sizes. Web body is **Body 1 (14/20)**; page titles **Title 2/Title 1**; section headers **Subtitle 1**; card titles **Subtitle 2**; meta text **Caption 1**.
- Weights: Regular (400) and Semibold (600) only. Bold (700) is reserved for Display.
- No letter-spacing tweaks, no all-caps eyebrow labels, no italics for emphasis.
- **Numbers:** ₹ amounts, escrow balances, PINs, time slots and transaction references use `tabular-nums` (`.tabular` / `font-mono` on web, `FluentType.numeric()` on mobile).

## Layout

- Container max-width `1280px`; 4px spacing grid using the Fluent spacing ramp (4, 8, 12, 16, 20, 24, 32).
- Discovery grid: 1 → 2 → 3 columns with 16–24px gaps.
- Web breakpoints follow Fluent responsive guidance: small < 640, medium 640–1023, large 1024–1365, x-large ≥ 1366.
- Mobile: 16px screen margins, bottom navigation with 5 destinations, sheets for secondary flows.

## Shape

- Web: Medium (4px) for buttons, inputs and menus; X-Large (8px) for cards, dialogs and popovers; Circular for avatars and pills.
- Mobile: Large (8px) for buttons/inputs/chips; X-Large (12px) for cards, sheets and dialogs.

## Elevation

- Use the Fluent shadow ramp only: cards rest at shadow4 and rise to shadow8 on hover; flyouts/menus shadow16; dialogs shadow64.
- No translate-on-hover lifts, no colored glows, no gradient blobs. Acrylic (`.acrylic`) is allowed for sticky headers and flyouts.

## Motion

- Durations 150 / 200 / 300ms with `curveEasyEase`; enter with `curveDecelerateMid`, exit with `curveAccelerateMid`.
- Motion explains state change (open, close, expand). No decorative looping animation. Respect `prefers-reduced-motion`.

## Accessibility

- WCAG 2.1 AA contrast for all text (4.5:1) and UI strokes (3:1).
- Focus: 2px solid stroke (`#000` light / `#FFF` dark) via `:focus-visible`; Fluent components handle this natively.
- Minimum touch target 44×44px on mobile and touch layouts.

## Product patterns

- **Booking:** keep the single canonical two-step escrow booking flow (select slot → confirm & pay into escrow), rendered as a Fluent Dialog on web and a bottom sheet / screen on mobile.
- **Escrow & wallet:** ledger rows use tabular numerals, right-aligned amounts, status Badges (success / warning / danger).
- **Verification:** verified identity shows a gold trust Badge with a shield-checkmark icon.
