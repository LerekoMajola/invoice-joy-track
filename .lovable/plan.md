

## Fix: Quote Preview Layout Clipping

### Root Cause
The `DocumentWrapper` component scales the A4 document (210mm = 793px wide) using CSS `transform: scale()`, but the **scale wrapper div has a fixed `width: '210mm'`**. When the scale is less than 1, the transformed content visually shrinks but the wrapper still occupies 793px of layout space — causing horizontal overflow and clipping within the `max-w-4xl` (896px) parent container in `QuotePreview.tsx`.

The outer container in `QuotePreview` also uses `overflow-x-hidden`, which silently clips the right edge.

### Plan

**File: `src/components/quotes/DocumentLayoutRenderer.tsx`** (lines 412-418)

Change the scale wrapper to not force a fixed 210mm width at the outer level. Instead, let it size to 100% of the container and only set the 210mm width on the inner document content (which it already does via `baseStyle`):

```tsx
// Current (line 414):
<div style={{ transformOrigin: 'top center', transform: `scale(${scale})`, width: '210mm', margin: '0 auto' }}>

// Fix:
<div style={{ transformOrigin: 'top left', transform: `scale(${scale})`, width: 793, margin: '0 auto' }}>
```

Wait — the real issue is that `transform: scale` doesn't change layout size. The outer div needs to account for the scaled dimensions. The fix:

1. **Scale wrapper** (line 414): Remove `width: '210mm'` from the scale wrapper. Set `width: 793` (the native A4 px width) but wrap it so the outer container compensates for the scale.

2. **Outer container** (line 413): Set explicit `width` and `height` to the **scaled** dimensions so layout flows correctly:

```tsx
<div ref={containerRef} className="w-full flex justify-center overflow-visible">
  <div style={{
    width: 793 * scale,
    minHeight: effectiveDocHeight * scale,
    overflow: 'visible',
  }}>
    <div style={{
      transformOrigin: 'top left',
      transform: `scale(${scale})`,
      width: 793,
    }}>
      {docContent}
    </div>
  </div>
</div>
```

This creates a properly-sized layout box that matches the visually-scaled document, preventing any clipping.

**File: `src/components/quotes/QuotePreview.tsx`** (line 162-163)

Change the outer container to allow proper overflow and remove the `overflow-x-hidden` that clips content:

```tsx
// Current:
<div className="fixed inset-0 z-50 bg-background overflow-y-auto overflow-x-hidden">
  <div className="w-full max-w-4xl mx-auto py-8 px-4">

// Fix:
<div className="fixed inset-0 z-50 bg-background overflow-y-auto">
  <div className="w-full max-w-5xl mx-auto py-8 px-4">
```

- Remove `overflow-x-hidden` — the scaled document will now fit properly
- Widen to `max-w-5xl` (1024px) to give the A4 document (793px) comfortable margins

### Summary

| File | Change |
|------|--------|
| `DocumentLayoutRenderer.tsx` | Wrap scaled document in a layout-sized container (width/height = native × scale), use `transformOrigin: top left`, center with flexbox |
| `QuotePreview.tsx` | Remove `overflow-x-hidden`, widen container to `max-w-5xl` |

