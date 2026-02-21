

## Fix: Portal Light Mode Contrast

### Problem

The portal layout has a working dark/light toggle, but all five content tabs use hardcoded dark-theme colors (e.g., `text-white`, `bg-white/[0.04]`, `text-white/30`). In light mode the background is `bg-gray-50` (near-white), making all white text invisible.

### Approach

Instead of rewriting every component with conditional classes, create a theme-aware wrapper using CSS variables scoped to `[data-portal-theme="light"]` and `[data-portal-theme="dark"]`. Each component will use these semantic CSS variables, applied via a small set of utility classes.

**Add portal theme CSS variables** in `src/index.css`:

```css
[data-portal-theme="dark"] {
  --portal-text: 255 255 255;
  --portal-card-bg: rgba(255,255,255,0.04);
  --portal-card-border: rgba(255,255,255,0.06);
  --portal-text-muted: rgba(255,255,255,0.40);
  --portal-text-dimmed: rgba(255,255,255,0.20);
  --portal-text-secondary: rgba(255,255,255,0.60);
}

[data-portal-theme="light"] {
  --portal-text: 17 17 17;
  --portal-card-bg: rgba(0,0,0,0.03);
  --portal-card-border: rgba(0,0,0,0.08);
  --portal-text-muted: rgba(0,0,0,0.50);
  --portal-text-dimmed: rgba(0,0,0,0.25);
  --portal-text-secondary: rgba(0,0,0,0.65);
}
```

Then update each component to swap hardcoded colors for theme-aware ones. The key substitutions across all files:

| Dark-only class | Light-mode equivalent |
|---|---|
| `text-white` | `text-[rgb(var(--portal-text))]` or simpler: conditional class via a shared helper |
| `text-white/40` | `text-[var(--portal-text-muted)]` |
| `text-white/30`, `text-white/20` | `text-[var(--portal-text-dimmed)]` |
| `bg-white/[0.04]` | `bg-[var(--portal-card-bg)]` |
| `border-white/[0.06]` | `border-[var(--portal-card-border)]` |

**To keep changes manageable**, I will create a small `usePortalTheme()` hook that reads the `data-portal-theme` attribute and returns a boolean `isDark`, plus a helper `pt(dark, light)` function. Components will use this to conditionally apply classes where CSS variables alone are insufficient (e.g., the gradient hero on the Home tab).

### Files to Change

| File | Change |
|------|--------|
| `src/index.css` | Add `[data-portal-theme]` CSS variable blocks for both themes |
| `src/hooks/usePortalTheme.ts` | **New** -- tiny hook returning `isDark` boolean from nearest `[data-portal-theme]` attribute |
| `src/components/portal/gym/GymMemberPortal.tsx` | Replace all hardcoded `text-white*` / `bg-white*` classes with theme-aware variants; adjust hero gradient for light mode |
| `src/components/portal/gym/GymPortalAttendance.tsx` | Same pattern -- swap all color classes to be theme-aware |
| `src/components/portal/gym/GymPortalProgress.tsx` | Same pattern for stat cards, sparklines, milestones, workout section, and log drawer |
| `src/components/portal/gym/GymPortalMembership.tsx` | Same pattern for plan card, history list, and proof modal |
| `src/components/portal/gym/GymPortalSchedule.tsx` | Same pattern for day pills, class cards, booking list, and bottom sheet |
| `src/components/portal/shared/PortalMessaging.tsx` | Same pattern if it uses hardcoded dark colors |

### Key Design Decisions

- **Light mode card style**: `bg-white shadow-sm border border-gray-200` instead of the translucent dark glass
- **Light mode text**: `text-gray-900` for primary, `text-gray-500` for muted, `text-gray-400` for dimmed
- **Hero gradient on Home tab (light)**: Keeps the mint-cyan gradient but with slightly lighter tones
- **Progress ring SVG track**: Changes from `rgba(255,255,255,0.06)` to `rgba(0,0,0,0.06)` in light mode
- **Drawers and modals**: Switch from dark backgrounds (`bg-[#12121a]`) to white (`bg-white`) in light mode
- **Accent colors** (#00E5A0, #00C4FF, #FFB800, etc.) remain the same in both modes -- they have good contrast on both dark and light backgrounds

### Implementation Pattern

Each component will import `usePortalTheme` and use a `pt()` helper for conditional classes:

```typescript
const { isDark } = usePortalTheme();
const pt = (dark: string, light: string) => isDark ? dark : light;

// Usage:
<p className={pt('text-white', 'text-gray-900')}>Hello</p>
<div className={pt('bg-white/[0.04] border-white/[0.06]', 'bg-white border-gray-200 shadow-sm')}>
```

This keeps the premium dark theme exactly as-is while adding proper contrast for light mode.
