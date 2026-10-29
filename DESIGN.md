---
# gstack: design-md-format=spec
name: Cue
description: Luxury hospitality warmth, discreet verified companionship, and escrow-backed financial integrity.
colors:
  primary: "#17212F"
  on-primary: "#FFFFFF"
  surface: "#FFFFFF"
  surface-dark: "#140B12"
  text: "#181412"
  text-muted: "#665D57"
  accent: "#881337"
  accent-hover: "#9F1239"
  accent-champagne: "#C5A059"
  success: "#15803D"
  warning: "#C5A059"
  error: "#DC2626"
  border: "#E8E2DC"
  border-dark: "#2A1824"
typography:
  display:
    fontFamily: "Instrument Serif"
    fontWeight: 400
    fontSize: "clamp(1.75rem, 3.5vw, 3rem)"
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "1rem"
    lineHeight: 1.6
  label:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "0.75rem"
    letterSpacing: "0.04em"
  mono:
    fontFamily: "JetBrains Mono"
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    borderColor: "{colors.border}"
  input:
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
  trust-badge:
    backgroundColor: "rgba(197, 160, 89, 0.12)"
    textColor: "{colors.accent-champagne}"
    borderColor: "rgba(197, 160, 89, 0.28)"
---

# Cue Design System

## Overview

**Creative North Star:** Luxury Hospitality & Discreet Verification — Booking an authentic, verified companion should feel as seamless, dignified, and secure as reserving a 5-star hotel concierge suite.
**Product Context:** Cue is an identity-verified, escrow-backed platonic companionship marketplace in India's top metropolitan hubs (Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Pune, Chennai).
**Modes per Surface:**
- **Discovery & Profile**: Persuade & Experience (Editorial portraiture, curated biographical quotes, verified companion specialties).
- **Booking & Escrow**: Operate (High-precision date, venue, activity selection, and two-step escrow vault confirmation).
- **Wallet & Payouts**: Operate (Clear financial ledger, ₹ rates, bank/UPI settlement schedules).
- **Admin Supervision**: Operate (High-density verification queues, KYC inspection, platform GMV).

## Colors

**Strategy:** Restrained Luxury Palette — Color is purposeful, rare, and communicates clear meaning.
- **Base Canvas**: Warm Cashmere Ivory (`#FAF7F2`) in daylight, Deep Velvet Noir (`#140B12`) in romantic/dark mode. Avoid stark blue-white backgrounds or cold monochrome grays.
- **Brand Accent**: Rich Bordeaux Velvet (`#881337`) with crimson hover (`#9F1239`). Replaces generic tech blue and aggressive neon orange with warm hospitality gravitas.
- **Trust & Verification**: Burnished Champagne Gold (`#C5A059` / `#D4AF37`) for verified checkmarks, ratings, and escrow vault badges.
- **Semantic Signals**:
  - Success / Escrow Cleared: Deep Forest Sage (`#15803D`)
  - Warning / Escrow Hold: Champagne Amber (`#C5A059`)
  - Destructive / Cancellation: Muted Crimson (`#DC2626`)

## Typography

- **Display Voice**: **Instrument Serif** (Google Fonts) — High-contrast, elegant editorial serif. Used for display titles, companion hero names, and modal headlines. It evokes curated hospitality journals and eliminates generic wedding-serif clichés.
- **Body & Controls**: **Plus Jakarta Sans** (Google Fonts) — Geometric, warm, contemporary humanist sans-serif with excellent legibility at micro-sizes (`11px` - `14px`).
- **Data & Numeric Ledger**: **JetBrains Mono** (Google Fonts) — Tabular figures (`tnum`) for all Indian Rupee amounts (`₹`), hourly rates, booking timestamps, and transaction IDs. Communicates Swiss-banking precision and contractual transparency.

## Layout & Hierarchy

- **Grid Discipline**:
  - Main container max-width: `80rem` (`max-w-7xl` / `1280px`).
  - Discovery Grid: Responsive 1-col (mobile) $\rightarrow$ 2-col (tablet) $\rightarrow$ 3-col (desktop) with strict `24px` (`gap-6`) breathing room.
  - Card Aspect Ratio: Curated 4:3 or 16:10 top photo frame with 3-photo interactive preview thumbnails.
- **Touch & Accessibility**:
  - Minimum touch targets: `44x44px` across all interactive buttons, pills, and pagination controls.
  - Form inputs: Explicit contrast, clear labels, and 2px focus rings in accent tone.

## Elevation & Depth

- **Tactile Softness**: Minimal elevation (`0 4px 20px -2px rgba(0, 0, 0, 0.05)`).
- **Zero-Halo Rule**: No neon glows, no colored halos, and no decorative SVG blobs. Depth is achieved through warm surface separation, soft 1px border lines (`#E8E2DC`), and subtle hover lifts (`translateY(-2px)`).

## Shapes & Radii

- **Radius Hierarchy**:
  - Micro-badges & chips: `6px` - `8px` (`rounded-md` / `rounded-lg`).
  - Action buttons & inputs: `10px` - `12px` (`rounded-xl`).
  - Content cards & modals: `16px` - `24px` (`rounded-2xl` / `rounded-3xl`).
  - Profile avatars & circular controls: `9999px` (`rounded-full`).

