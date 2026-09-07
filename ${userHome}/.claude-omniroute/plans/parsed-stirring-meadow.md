# Application Theme Plan: Pink Primary Color

## Context
The current LoveAgain frontend application uses a blue-based color scheme throughout the UI. The user requests a theme update to use pink as the primary color with a matching, cohesive color palette. This change will affect all UI components that currently use blue shades for primary actions, backgrounds, accents, and interactive elements.

## Current State Analysis
From code exploration, the application currently uses:
- Blue-500/600/700 for primary buttons, links, and accents
- Gray variants for backgrounds, text, and borders
- Gradient effects using blue-indigo combinations
- Custom CSS variables defined in `src/index.css` for design tokens

Key files containing color usage:
- `src/tailwind.config.js` - Theme configuration and custom utilities
- `src/index.css` - CSS variable definitions and base styles
- `src/pages/Home.tsx` - Primary color usage in hero section, buttons, features
- `src/components/Header.tsx` - Primary color in logo and text
- `src/pages/Login.tsx`, `Register.tsx` - Form elements and buttons
- `src/pages/Discovery.tsx`, `Profile.tsx`, `ProviderDashboard.tsx` - Various UI components

## Recommended Approach
Implement a pink-based theme by updating the color system in three layers:

### 1. Update CSS Design Tokens (`src/index.css`)
Replace blue-based CSS variables with pink equivalents while maintaining the same structure:
- `--primary`: Pink-600 (base pink)
- `--primary-foreground`: White or pink-50 for contrast
- `--secondary`: Pink-50 or gray variants
- Update accent, destructive, muted colors to harmonize with pink
- Keep `--background`, `--foreground`, `--border`, etc. as neutral values

### 2. Update Tailwind Configuration (`src/tailwind.config.js`)
Modify the theme extension to map Tailwind color classes to our new pink palette:
- Update `colors` section to map `primary`, `secondary`, etc. to pink hues
- Maintain gradient animations and keyframes unchanged
- Keep custom utilities (`.bg-background`, `.text-foreground`, etc.)

### 3. Update Component Usage (Where Necessary)
Most components use Tailwind utility classes that will automatically pick up the new theme:
- Buttons using `bg-primary`, `hover:bg-primary/80` will become pink
- Text using `text-primary`, `text-primary-foreground` will adapt
- Gradients using `from-blue-500 to-indigo-600` may need updating to pink variants
- Border colors using `border-[hsl(var(--border))]` will remain unchanged (neutral)

## Specific Changes Required

### src/index.css
Update the :root and .dark sections with pink-based hues:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  --primary: 350 65% 55%;   /* Pink-600 */
  --primary-foreground: 350 20% 98%; /* Pink-50 */
  
  --secondary: 350 40% 96%; /* Pink-100 */
  --secondary-foreground: 350 65% 55%; /* Pink-600 */
  
  --muted: 350 20% 96%; /* Pink-50 */
  --muted-foreground: 350 15% 45%; /* Pink-500 */
  
  --accent: 350 20% 96%; /* Pink-100 */
  --accent-foreground: 350 65% 55%; /* Pink-600 */
  
  --destructive: 0 84.2% 60.2%; /* Keep red for errors */
  --destructive-foreground: 210 40% 98%;
  
  --border: 214.3 31.8% 91.4%; /* Keep neutral */
  --input: 214.3 31.8% 91.4%; /* Keep neutral */
  --ring: 222.2 84% 4.9%; /* Keep neutral */
  --radius: 0.5rem;
}

/* Dark mode adjustments */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  
  --primary: 350 65% 55%;   /* Pink-600 */
  --primary-foreground: 350 20% 98%; /* Pink-50 */
  
  /* ... other dark mode colors adjusted for pink ... */
}
```

### src/tailwind.config.js
Update the color mapping in the theme.extend.colors section:
```javascript
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  
  // Primary colors - now pink-based
  primary: "hsl(var(--primary))",
  "primary-foreground": "hsl(var(--primary-foreground))",
  
  // Secondary colors
  secondary: "hsl(var(--secondary))",
  "secondary-foreground": "hsl(var(--secondary-foreground))",
  
  // Keep other semantic colors mapped to variables
  muted: "hsl(var(--muted))",
  "muted-foreground": "hsl(var(--muted-foreground))",
  accent: "hsl(var(--accent))",
  "accent-foreground": "hsl(var(--accent-foreground))",
  destructive: "hsl(var(--destructive))",
  "destructive-foreground": "hsl(var(--destructive-foreground))",
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
},
```

## Verification Plan
1. **Build Verification**: Run `npm run build` to ensure no CSS/TypeScript errors
2. **Development Server**: Start `npm run dev` and visually inspect:
   - Login/Register pages - primary buttons should be pink
   - Home page - hero section, feature icons, CTA buttons
   - Header - logo and text colors
   - All interactive elements - hover/focus states
   - Dark mode toggle (if implemented) - proper pink variants
3. **Component Spot Check**: Verify key components render correctly:
   - Buttons: Primary, secondary, outline variants
   - Forms: Inputs, labels, validation states
   - Navigation: Links, active states
   - Cards: Backgrounds, borders, shadows
   - Gradients: Updated to pink-purple or pink-white combinations
4. **Responsive Check**: Ensure colors display correctly at all breakpoints
5. **Accessibility**: Verify color contrast ratios meet WCAG guidelines for text and interactive elements

## Files to Modify
1. `src/index.css` - CSS design tokens (primary file)
2. `src/tailwind.config.js` - Theme configuration
3. Optional gradient updates in:
   - `src/pages/Home.tsx` (hero gradients, feature sections)
   - `src/components/Header.tsx` (logo background)
   - `src/pages/ProviderDashboard.tsx` (avatar backgrounds)
   - `src/pages/Profile.tsx` (avatar background)
   - `src/pages/Discovery.tsx` (provider cards)

## Outcome
The application will maintain identical layout, spacing, typography, and component structure while presenting a fresh pink-based visual identity. All interactive elements will use appropriate pink shades for primary actions, with neutral grays and whites for backgrounds and secondary elements, creating a warm, welcoming aesthetic suitable for a social companionship platform.