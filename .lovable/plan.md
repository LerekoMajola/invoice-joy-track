

## Fix: Quote Preview Hidden Behind Sidebar

### Root Cause

The `PageTransition` component applies `translate-y-0` / `translate-y-2` CSS transforms to animate page transitions. In CSS, **any element with a `transform` property creates a new stacking context**. This means the `z-50` on the `QuotePreview` component only applies *within* that stacking context — it cannot escape above the sidebar (`z-40`) which sits outside that context.

```text
DashboardLayout
├── Sidebar (fixed, z-40)          ← stacking context A
├── main
│   └── PageTransition (transform) ← creates stacking context B
│       └── QuotePreview (fixed, z-50) ← z-50 only within B, cannot beat A
```

### Fix

**File: `src/components/quotes/QuotePreview.tsx`**

Render the quote preview via a **React portal** to `document.body`. This moves it outside the `PageTransition` stacking context entirely, allowing its `z-50` to work correctly against the sidebar's `z-40`.

- Import `createPortal` from `react-dom`
- Wrap the entire return JSX in `createPortal(..., document.body)`
- No other changes needed — the `fixed inset-0 z-50` styling already handles positioning

This is a minimal, surgical fix — one import and one wrapper.

### Files Changed

| File | Change |
|------|--------|
| `src/components/quotes/QuotePreview.tsx` | Wrap return in `createPortal` to escape stacking context |

