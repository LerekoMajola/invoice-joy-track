

## Fix: Document Preview Cut Off Inconsistently

### Root Cause

The `DocumentWrapper` scaling logic has a timing issue. It calculates the scale once on mount using `containerRef.current.parentElement?.clientWidth`, but:

1. **The `containerRef` is placed on the wrong element** — it's on the inner scale wrapper, and its parent width may not represent the actual available container width reliably.
2. **No re-calculation on content/layout changes** — the scale is only computed on mount and window resize, but the container may not have its final dimensions at mount time (e.g., when rendered inside a dialog or when data loads asynchronously).
3. **Different accounts = different data/content** — one account may have more toolbar buttons or different layout states that shift the container width, causing the initial scale calculation to differ.

### Fix

1. **Move `containerRef` to a dedicated outer measurement wrapper** that sits above the scale transform, so `clientWidth` and available height are measured from the correct element.
2. **Use `ResizeObserver` on the outer container** instead of just `window.resize`, so the scale recalculates whenever the container's actual dimensions change (e.g., after dialog animation, sidebar toggle, data load).
3. **Add a small delay fallback** (`requestAnimationFrame`) on mount to ensure the first measurement happens after layout settles.

### Changes

**File: `src/components/quotes/DocumentLayoutRenderer.tsx`** — `DocumentWrapper` component (~lines 331-419)

- Add a new outer `<div ref={containerRef}>` that wraps everything and is used solely for measuring available width/height.
- Replace the `window.resize` listener with a `ResizeObserver` on this outer container.
- Use `containerRef.current.clientWidth` (not `parentElement`) for width measurement.
- Use `containerRef.current.clientHeight || (window.innerHeight - 120)` for height measurement, preferring the container's own height when available.
- Keep the existing `docRef` / `ResizeObserver` for tracking actual document content height.

```text
┌─ outer div (ref=containerRef) ── measures available space ──┐
│  ┌─ scale wrapper div ── transform: scale(s) ──────────────┐│
│  │  ┌─ document div (ref=docRef) ── 210mm x 297mm ────────┐││
│  │  │  ... content ...                                     │││
│  │  └──────────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

