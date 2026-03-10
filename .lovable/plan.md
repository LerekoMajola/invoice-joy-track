

## Fix: Document Preview Still Cut Off

### Root Cause

In `DocumentWrapper`, `containerRef.current.clientHeight` measures the container's own content height — which includes the full unscaled document (~1123px). This means:

```
containerHeight = 1123  (its own content)
viewportHeight = Math.max(1123, window.innerHeight - 120) = 1123
scaleY = 1123 / 1123 = 1  ← never scales down!
```

The height-based scaling never activates because the container is measuring itself rather than the available viewport space.

### Fix

**File: `src/components/quotes/DocumentLayoutRenderer.tsx`** — lines 339-348

Remove `containerHeight` from the calculation entirely. For height, always use `window.innerHeight` minus offset (the fixed overlay viewport is the constraint, not the container). Only use the container for width measurement.

```typescript
const updateScale = () => {
  if (!containerRef.current) return;
  const containerWidth = containerRef.current.clientWidth || 800;
  const availableHeight = window.innerHeight - 160; // toolbar + padding + margins
  const scaleX = Math.min(1, containerWidth / 793);
  const scaleY = Math.min(1, availableHeight / 1123);
  setScale(Math.min(scaleX, scaleY));
};
```

The 160px offset accounts for: sticky toolbar (~56px), `py-8` padding (64px), and `mb-4` margin (16px) in the QuotePreview layout.

