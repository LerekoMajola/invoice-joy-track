

# Fix WhatsApp Button Being Blocked

## The Problem
Safari (and the Lovable preview iframe) blocks `window.open()` to external sites like `wa.me` due to Cross-Origin-Opener-Policy. This causes the "Safari Can't Open the Page" error.

## The Fix

### File: `src/components/workshop/JobCardDetailDialog.tsx`

Replace `window.open()` with a dynamically created anchor tag click, which browsers treat as a trusted navigation rather than a popup:

**Current code (line ~446):**
```js
window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
```

**New approach:**
```js
const link = document.createElement('a');
link.href = `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
link.target = '_blank';
link.rel = 'noopener noreferrer';
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
```

This method is not blocked by Cross-Origin-Opener-Policy because anchor element clicks are treated as user-initiated navigations by the browser.

### No other files affected
Only one line changes in one file.

