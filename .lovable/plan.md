
Fix quote PDF export by addressing the real failure point, not the old save step.

What I found
- `QuotePreview.tsx` already has the `isDownloading` state and already calls `exportHighQualityPDF(...)`.
- `src/lib/pdfExport.ts` already uses a blob URL download helper instead of relying only on `pdf.save(...)`.
- So the current bug is not “the save call never triggers”.
- Your screenshot and the current button state mean the export promise is getting stuck before completion, which is why the button stays on “Generating…”.
- The quote path still captures the entire quote as one large `html2canvas` render, then slices it afterward. That is fragile for long quotes with many rows, logos, signatures, and custom fonts.
- Other document flows in this codebase are already moving toward section-based export (`DeliveryNotePreview`, `HireOrderPreview`), which is a better fit here.

Likely root cause
- The quote exporter is trying to rasterize one very tall live DOM node at once.
- On larger quotes, `html2canvas` can stall or take an extremely long time, so `exportHighQualityPDF(...)` never resolves and the UI never leaves the loading state.
- In short: the download helper is fine, but the quote capture strategy is too heavy.

Implementation plan
1. Replace the quote export strategy with page-aware/section-aware capture
- Stop using the single huge-canvas path for quotes.
- Update `QuotePreview.tsx` to mark logical blocks with `data-pdf-section`:
  - header/client block
  - description block
  - totals block
  - terms / notes / signature / footer block
- For the line-items table, do not export the whole table as one giant section on long quotes.
- Instead, chunk rows into export-sized groups and render repeatable table headers per chunk during export so multi-page quotes stay reliable.

2. Extend `src/lib/pdfExport.ts` with a quote-safe export path
- Keep the current blob download helper.
- Add a new export routine specifically for long documents/tables:
  - validate measurable width/height first
  - capture smaller sections/chunks instead of the full document at once
  - add per-stage timeouts so the promise always resolves or throws
  - surface clear errors when capture fails instead of hanging forever
- Keep `exportHighQualityPDF(...)` for short/simple documents that still benefit from screenshot-mode output.

3. Update quote UI feedback so it never gets stuck silently
- In `QuotePreview.tsx`, keep the loading state but make failure visible:
  - show a toast when generation starts
  - show success/failure toast when done
  - always reset `isDownloading` in error and timeout cases
- Optionally disable other top-bar actions during export to avoid overlapping interactions.

4. Keep a safe fallback for urgent sending
- If the new export path fails, provide a visible fallback path instead of leaving the user blocked:
  - either fall back to the browser print-to-PDF flow
  - or show a clear “PDF generation failed, try Print” message
- This is important because you need to send the document to clients, so the flow should degrade safely.

Files to update
- `src/components/quotes/QuotePreview.tsx`
- `src/lib/pdfExport.ts`
- Possibly a small helper extracted near the quote table rendering if row chunking needs shared markup

Technical details
- No backend/database changes are needed.
- The main code change is architectural: quotes should stop exporting as one full-height screenshot and instead export in controlled chunks/pages.
- This should also reduce memory pressure and make large quotes much more reliable on both preview and published environments.

Validation after implementation
- Test with the current failing quote on `/quotes`
- Test both preview and published URLs
- Confirm:
  - clicking Download starts once
  - the spinner clears
  - a `.pdf` file actually downloads
  - long tables paginate correctly
  - logo/signature still render correctly
  - failure paths show a visible message instead of hanging
