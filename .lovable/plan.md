

## Fix: Document Preview Not Fitting on Screen

### Problem
The scaling logic only considers **width** — it shrinks the document horizontally to fit the container. But the A4 document is 297mm tall (~1123px), which exceeds most viewport heights. So the user still has to scroll vertically to see the full quote.

### Solution
Scale the document to fit **both** width and height of the available viewport. Take the smaller of the two scale factors (width vs height) so the entire document is visible without scrolling.

### Changes

**File: `src/components/quotes/DocumentLayoutRenderer.tsx`** (DocumentWrapper)

Update the scale calculation to also consider available height:

```
const viewportHeight = window.innerHeight - 120; // subtract toolbar + padding
const docWidth = 793;  // 210mm
const docHeight = 1123; // 297mm
const scaleX = Math.min(1, parentWidth / docWidth);
const scaleY = Math.min(1, viewportHeight / docHeight);
const newScale = Math.min(scaleX, scaleY);
```

This ensures the full A4 page fits within the visible area. The `120px` offset accounts for the sticky toolbar and container padding.

