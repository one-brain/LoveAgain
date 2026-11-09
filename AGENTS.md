# Cue Engineering & Design Guidelines for Agents

## Design System Source of Truth

Cue uses **Microsoft Fluent 2** (https://fluent2.microsoft.design/) on web and mobile. All UI decisions, tokens and rules are codified in [`DESIGN.md`](./DESIGN.md).

- **Web:** `@fluentui/react-components` (v9) for interactive controls, themed by `frontend/src/theme/fluentTheme.ts` and wrapped by `<ThemeProvider>` (light / dark / system). Tailwind v4 is for layout and semantic tokens defined in `frontend/src/index.css`. Icons: `@fluentui/react-icons`.
- **Mobile (Flutter):** Material 3 theme mapped to Fluent 2 tokens in `mobile/lib/core/theme.dart` (`FluentBrand`, `FluentType`, `FluentRadius`, `FluentSpacing`, `FluentShadows`, `FluentMotion`, `AppColors`).
- **Typography**: The Fluent font stack (Segoe UI / SF Pro / Roboto) with the Fluent type ramp. Regular and Semibold only. Tabular numerals (`tabular-nums`) for all Indian Rupee pricing (`₹`), escrow balances, PINs, time slots, and transaction references.
- **Brand color**: Fluent brand ramp generated from Cue Bordeaux `#881337` (brand 80). Neutrals, status colors, radii, elevation and motion are Fluent defaults. Gold (`trust`) only for verified/escrow trust signals.
- **Rules**:
  - Use tokens, never raw hex values in components.
  - No gradients, decorative blobs, neon glows, or translate-on-hover lifts. Elevation comes from the Fluent shadow ramp.
  - Strictly maintain 44x44px minimum touch targets on mobile.
  - Keep the single canonical two-step escrow booking pattern.
