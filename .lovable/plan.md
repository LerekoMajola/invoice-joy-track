

## Fix Invoice PDF Logo Skewing - Fixed A4 Layout

### Problem
The logo continues to skew in the downloaded PDF because the logo container uses a fixed square box (60x60px / 50x50px) that forces the logo into a square regardless of its natural aspect ratio. Additionally, `html2canvas` still struggles with geometry even after the "screenshot mode" changes.

### Solution
Apply the user's exact specifications: fixed-width logo (140px) with auto height, `object-fit: contain`, no transforms, and a fixed-width A4 container.

### Changes

#### 1. `src/components/admin/AdminInvoicePreview.tsx` - Logo markup

**Current** (lines 193-198): Logo forced into a 60x60 square container with a 50x50 image.

**New**: 
- Remove the fixed square wrapper
- Logo image: `width: 140px`, `height: auto`, `object-fit: contain`, `display: block`
- Left-aligned with padding inside the table cell
- No percentage widths, no transforms
- Table cell width increased to accommodate 140px logo + padding

#### 2. `src/lib/pdfExport.ts` - `exportHighQualityPDF`

Simplify the capture to avoid transform scaling and respect the fixed A4 container:

- Remove the dynamic `SCALE` calculation tied to `devicePixelRatio` -- use a fixed scale of `2` (sufficient for sharp output without distortion)
- In the image geometry freeze step, do NOT override `objectFit` or dimensions for images that already have explicit pixel widths set (i.e., the logo). Only freeze images that use `auto` or percentage sizing
- Use `width` and `windowWidth` from `sourceElement.offsetWidth` (the fixed 595px container) instead of `getBoundingClientRect()` which can include sub-pixel rounding
- Keep PNG output and multi-page slicing logic unchanged

### Technical Details

**AdminInvoicePreview.tsx logo cell change:**
```
// Before
<div style={{ width: '60px', height: '60px', ... }}>
  <img style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
</div>

// After
<img 
  src={logoUrl} 
  alt="Logo"
  style={{ 
    width: '140px', 
    height: 'auto', 
    objectFit: 'contain',
    display: 'block',
    maxHeight: '60px',
  }} 
  crossOrigin="anonymous" 
/>
```
- Table cell width updated from `72px` to `160px` to fit the wider logo with padding
- White background box with rounded corners preserved around the logo area

**pdfExport.ts changes:**
- Fixed scale of `2` instead of DPR-based calculation
- Skip geometry freezing for images with explicit pixel `width` already set (prevents overriding the deterministic 140px logo)
- Use `offsetWidth` (595) instead of `getBoundingClientRect().width` for capture dimensions
- No `transform` scaling at any point in the pipeline

### Files Modified
- `src/components/admin/AdminInvoicePreview.tsx` -- logo container and image styles
- `src/lib/pdfExport.ts` -- simplified, stable capture with no transform scaling
