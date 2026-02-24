
Goal: completely replace the current invoice download implementation with a new high-quality export pipeline that avoids logo skewing and keeps layout/spacing matched to the on-screen preview.

What I found in your current code:
- The download button in `src/components/admin/AdminInvoicePreview.tsx` uses `html2canvas -> JPEG -> jsPDF`.
- JPEG export (`canvas.toDataURL('image/jpeg', 1.0)`) can introduce visual artifacts and edge distortion, especially around logos/text.
- The same `contentRef` node is rendered for screen and capture, so any runtime image timing/stretch issue directly affects PDF output.
- Download and email currently share similar generation logic, but you confirmed scope is **download only**.

Implementation approach (download only):
1. Remove existing download PDF generator logic in `AdminInvoicePreview`
- Delete the current `handleDownloadPDF` body and replace it with a new high-quality flow.
- Keep email sending flow untouched (as requested).

2. Recreate download export using a robust, lossless capture pipeline
- Use a dedicated helper function in `src/lib/pdfExport.ts` (or a new admin-specific export helper) for invoice download.
- Capture with:
  - higher DPR-aware scale (`Math.max(3, window.devicePixelRatio * 2)`, capped for performance)
  - `useCORS: true`
  - explicit `width`/`windowWidth` from element layout width
  - `backgroundColor: '#ffffff'`
  - `imageTimeout` and a small pre-capture wait to ensure images finish decoding.
- Export image as **PNG** (lossless) instead of JPEG.
- Insert into A4 `jsPDF` with exact width mapping and no extra compression.

3. Add image normalization step to prevent logo distortion
- Before capture, ensure the logo image is fully decoded (`img.decode()` where supported).
- During html2canvas clone (`onclone`), enforce deterministic logo sizing styles in the cloned DOM:
  - fixed width/height box
  - `object-fit: contain`
  - `display: block`
  - no inherited transforms
- This prevents async image/layout variance from skewing in the final canvas.

4. Make download rendering isolated and stable
- Clone the preview content into an offscreen, fixed-width container (same A4 pixel width as preview) and capture that clone.
- This avoids side effects from sheet scrolling/animations and produces repeatable output every time.

5. Preserve UI behavior
- Keep the existing “PDF” button and filename format (`${invoice.invoice_number}.pdf`).
- Add loading toast and error handling for download generation failures.
- No UI redesign; only behind-the-scenes export engine replacement.

Files to update:
- `src/components/admin/AdminInvoicePreview.tsx`
  - remove old download generation
  - call new high-quality download exporter
  - keep email generation path unchanged
- `src/lib/pdfExport.ts`
  - add a dedicated high-quality invoice download helper (lossless PNG + stable capture + logo normalization)

Validation checklist after implementation:
- Downloaded PDF logo is not skewed/stretched.
- Text and lines are crisp (no heavy pixelation).
- Alignment matches preview (header, bill-to/details, table columns, totals, banking block).
- Multiple repeated downloads produce consistent output.
- Email send behavior remains unchanged.

Technical notes and trade-offs:
- PNG increases PDF size compared to JPEG, but gives much better visual fidelity.
- Higher scale improves clarity but can increase generation time on slower devices; I’ll keep a safe cap to balance quality and responsiveness.
- This plan intentionally avoids touching backend/email paths to match your scope exactly.
