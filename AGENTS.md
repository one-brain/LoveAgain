# Cue Engineering & Design Guidelines for Agents

## Design System Source of Truth

All user interface decisions, visual styles, colors, typography, layout rules, and tokens are codified in [`DESIGN.md`](./DESIGN.md).

- **Display Typography**: `Instrument Serif` (for hero titles, companion names, and modal headlines).
- **Body & Controls**: `Plus Jakarta Sans` (for readable, clean copy and UI controls).
- **Data & Numeric Ledger**: `JetBrains Mono` with tabular numerals (`tnum`) for all Indian Rupee pricing (`₹`), escrow balances, time slots, and transaction references.
- **Brand Palette**:
  - Warm Cashmere Ivory (`#FAF7F2`) base background.
  - Rich Bordeaux Velvet (`#881337`) primary action accent with `#9F1239` hover.
  - Burnished Champagne Gold (`#C5A059`) for verified trust badges, ratings, and escrow guarantees.
- **Rules**:
  - No purple gradient SaaS templates, no decorative floating blobs, no neon halos.
  - Strictly maintain 44x44px minimum touch targets on mobile.
  - Keep the single canonical two-step escrow booking pattern.

