# Cue Frontend Design Guidelines

These guidelines define the visual language, interaction patterns, and content principles for the Cue application. They ensure a consistent, accessible, and distinctive user experience across all frontend surfaces.

## 1. Color Palette

Derived from Tailwind configuration (`tailwind.config.js`). Use these semantic tokens rather than raw hex values.

### Primary
- `primary-50`: #fdf8f3
- `primary-100`: #faebdc
- `primary-200`: #f5d5ba
- `primary-300`: #edb88e
- `primary-400`: #e4945d
- `primary-500`: #dc7535
- `primary-600`: #c45d29
- `primary-700`: #a04722
- `primary-800`: #813920
- `primary-900`: #69311e
- `primary-950`: #37150c

### Accent
- `accent-50`: #fefce8
- `accent-100`: #fef9c3
- `accent-200`: #fef08a
- `accent-300`: #fde047
- `accent-400`: #facc15
- `accent-500`: #eab308
- `accent-600`: #ca8a04
- `accent-700`: #a16207
- `accent-800`: #854d0e
- `accent-900`: #713f12

### Neutrals (via darkMode: class)
- Light mode: `gray-50` to `gray-900`
- Dark mode: use `dark:` prefix (e.g., `dark:bg-gray-800`)

### Usage Principles
- **Primary** for key actions, brand elements, and focal points.
- **Accent** for highlights, decorative elements, and secondary calls‑to‑action.
- Maintain WCAG 2.1 AA contrast ratios (≥4.5:1 for normal text, ≥3:1 for large text).
- Never use color as the sole means of conveying information.

## 2. Typography

### Font Families
- **Sans** (default): `Inter`, `system-ui`, `sans-serif`
- **Serif** (for headings, quotes, emphasis): `Playfair Display`, `Georgia`, `serif`

### Type Scale
Use Tailwind's default `text-*` utilities with intentional weights:
- `text-xs`: 0.75rem (12px) — captions, helper text
- `text-sm`: 0.875rem (14px) — form labels, secondary text
- `text-base`: 1rem (16px) — body copy, inputs
- `text-lg`: 1.125rem (18px) — sub‑headings
- `text-xl`: 1.25rem (20px) — section titles
- `text-2xl`: 1.5rem (24px) — major headings
- `text-3xl`: 1.875rem (30px) — page titles
- `text-4xl`: 2.25rem (36px) — hero headings
- `text-5xl`: 3rem (48px) — large marketing headings

### Weights
- `font-light`: 300
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700
- `font-extrabold`: 800
- `font-black`: 900

### Usage Principles
- Pair a display face (serif for headings) with a neutral body face (sans‑serif) to create personality.
- Use semantic HTML heading elements (`h1`–`h6`) in hierarchical order.
- Apply `leading-relaxed` for body copy, `leading-tight` for headings.
- Never set body text smaller than `text-sm` (14px) for readability.

## 3. Layout & Spacing

### Spacing Scale
Use Tailwind's default spacing scale (multiples of 0.25rem):
- `px-0` to `px-20` (horizontal padding)
- `py-0` to `py-20` (vertical padding)
- `space-x-*` / `space-y-*` for gaps between children
- `gap-*` in grid/flex containers

### Common Layout Tokens
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Section vertical padding**: `py-16` (compact), `py-20` (default), `py-24` (spacious)
- **Border radius**: `rounded-none`, `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`
- **Shadows**: `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-inner`

### Usage Principles
- Align content to the 8‑point grid where possible.
- Keep generous whitespace to improve scan‑ability and reduce cognitive load.
- Use consistent vertical rhythm between sections.
- Prefer CSS Grid for two‑dimensional layouts; Flexbox for one‑dimensional alignment.

## 4. Component Standards

All UI components should follow these rules:

### Primitives
- **Button**: Use the shared `Button` component (`src/components/Button.tsx`). Variants: `primary`, `secondary`, `outline`. Sizes: `sm`, `md`, `lg`.
- **Card**: Use the shared `Card` component (`src/components/Card.tsx`). Provides consistent elevation, hover lift, and rounded corners.
- **Layout**: Wrap page‑level content in `Layout` (`src/components/Layout.tsx`) for global styles (transitions, focus rings, reduced‑motion support).

### States
- Every interactive element must have distinct `:hover`, `:focus-visible`, `:active`, and `:disabled` styles.
- Use `focus-ring-2 focus-ring-primary-500 dark:focus-ring-offset-gray-800` for keyboard focus visibility.
- Respect `prefers-reduced-motion`: disable non‑essential animations when the user requests reduced motion.

### Accessibility
- All interactive controls must be reachable via keyboard and have a meaningful `aria-label` or visible label.
- Icons used as controls must be accompanied by accessible text (visually hidden if needed).
- Color contrast must meet AA minimums.
- Avoid relying solely on color to convey state; supplement with icons, text, or patterns.

## 5. Motion & Animation

### Principles
- Motion should serve a purpose: convey hierarchy, provide feedback, or illustrate state changes.
- Prefer subtle, natural‑feeling easing (`cubic-bezier(0.4, 0, 0.2, 1)`) and short durations (150‑300ms).
- Reserve longer, more expressive animations for empty states, onboarding, or celebratory moments.

### Standard Animations
- **Float**: Gentle vertical oscillation used for background shapes (see `Navigation.tsx` and `HeroSection.tsx`).
- **Pulse**: Soft scaling/opacity change for accent elements.
- **Spin**: Continuous rotation for decorative loading indicators.
- **Hover lift**: `-translate-y-2` on cards and buttons to indicate interactivity.

### Usage Principles
- Never animate layout‑triggering properties (width, height, top, left) unless absolutely necessary; use `transform` and `opacity` instead.
- Provide a mechanism to respect `prefers-reduced-motion` (Tailwind already does this globally via our `Layout` styles).

## 6. Content & Writing Style

### Voice & Tone
- **Conversational**: Plain verbs, sentence case, no jargon.
- **Help‑first**: Explain what went wrong and how to fix it, in the interface’s voice.
- **Active**: Controls should say exactly what happens when used (“Save changes”, not “Submit”).

### Microcopy
- **Labels**: Name things by what people control and recognize (e.g., “Phone number”, not “User contact digit sequence”).
- **Helper text**: Appear below fields, concise, sentence case.
- **Errors**: Appear inline, use `text-red-600 dark:text-red-400`, and describe the problem and solution.
- **Empty states**: Treat as invitations to act; include a clear primary action.

### Formatting
- Use sentence case for all UI strings unless a proper noun or brand name requires title case.
- Do not use exclamation marks for excitement; let the design and interaction convey enthusiasm.
- Avoid filler words (“please”, “kindly”) unless required for politeness in specific cultures.

## 7. Signature Element

The single unique, memorable aspect of the Cue homepage is the **interactive, layered background shapes** that respond to user motion (floating, pulsing, spinning elements) combined with a **gradient‑text hero headline** that shifts hue on hover.

- The background shapes use SVG‑based gradients with `animate-[float_*]` and `animate-[pulse_*]` keyframes.
- The hero headline uses `bg-clip-text text-transparent bg-gradient-to-r` to create a vibrant, brand‑colored title.
- This pairing gives the page depth and dynamism while keeping the foreground content crisp and legible.

## 8. Implementation Checklist

Before marking a UI change as complete, verify:

- [ ] Uses defined color, typography, and spacing tokens.
- [ ] Interactive components share the `Button` or `Card` primitives where appropriate.
- [ ] All interactive elements are keyboard accessible and have visible focus rings.
- [ ] Color contrast ratios meet WCAG 2.1 AA.
- [ ] Animations respect `prefers-reduced-motion`.
- [ ] Content follows the voice and tone guidelines.
- [ ] The signature element (if present on the page) is implemented as described.

These guidelines will evolve with the product. Update this document whenever a new pattern is introduced or an existing one is refined.