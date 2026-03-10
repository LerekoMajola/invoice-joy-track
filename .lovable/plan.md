

## Fix: Document Content Cut Off / Requires Scrolling

### Problem
The `DocumentWrapper` in `DocumentLayoutRenderer.tsx` forces the outer container height to `Math.max(docHeight || 1123, 1123) * scale`. While this ensures a minimum A4 height, it also **caps** the visible height at `1123 * scale` when the document content is taller than one A4 page. The content overflows but the container doesn't grow to accommodate it, causing the cutoff line you see.

Additionally, the scale calculation uses the fixed A4 height (`1123px`) for the Y-axis scale, which can shrink the document unnecessarily.

### Fix — `src/components/quotes/DocumentLayoutRenderer.tsx`

Two changes:

1. **Line 385** — Let the outer container grow with actual content instead of clamping to A4 minimum:
   ```typescript
   // Before:
   const effectiveDocHeight = Math.max(docHeight || 1123, 1123);
   // After:
   const effectiveDocHeight = docHeight || 1123;
   ```

2. **Lines 346-348** — Scale only on X-axis (width). Remove the Y-axis scale constraint so the document is never vertically shrunk, only horizontally fitted. The parent container already scrolls:
   ```typescript
   // Before:
   const scaleX = Math.min(1, containerWidth / docWidth);
   const scaleY = Math.min(1, viewportHeight / docH);
   setScale(Math.min(scaleX, scaleY));
   // After:
   const scaleX = Math.min(1, containerWidth / docWidth);
   setScale(scaleX);
   ```

This ensures the full document is visible and scrollable — no cutoff. PDF export is unaffected since it captures the full element at native dimensions.

### Files Changed
| File | Change |
|------|--------|
| `src/components/quotes/DocumentLayoutRenderer.tsx` | Remove Y-axis scale clamping; let container height follow actual content |

