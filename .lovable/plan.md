
Fix: Quote PDF button runs, but no file is actually downloaded

What I found
- The button click is firing. The session replay shows multiple `html2canvas-container` iframes being created and removed after you click.
- There are no PDF error logs, which means the failure is happening late in the flow, after rendering starts.
- Quotes use a different export path from the other documents:
  - `QuotePreview` uses `exportHighQualityPDF(...)`
  - invoices/payslips/job cards still use `html2pdf`
  - delivery notes use `exportSectionBasedPDF(...)`
- The likely weak point is the final `pdf.save(filename)` call inside `src/lib/pdfExport.ts`. In this preview environment, that async save step is likely not triggering a real browser download reliably.

Plan
1. Harden the quote download helper
- File: `src/lib/pdfExport.ts`
- Keep the current high-quality rendering logic.
- Replace the final `pdf.save(filename)` with a more reliable blob download flow:
  - generate a Blob from the PDF
  - create an object URL
  - create a temporary `<a download>`
  - append to `document.body`, click it, then clean it up
- Add a fallback path if the blob download fails.

2. Make the Quote download button stateful and visible
- File: `src/components/quotes/QuotePreview.tsx`
- Add `isDownloading` state.
- Disable the button while the PDF is being prepared so repeated clicks do not start overlapping exports.
- Show clear success/error toast messages so failures are visible instead of silent.

3. Add defensive checks before export
- File: `src/lib/pdfExport.ts`
- Fail early with a clear error if the quote element has no measurable size (`offsetWidth`/`scrollHeight` is 0).
- Wrap the capture/save stages separately so it is easier to see whether the failure is in capture or download.

4. Clean up the quote preview ref warning if it affects capture stability
- Files: `src/components/quotes/QuotePreview.tsx`, `src/components/quotes/DocumentLayoutRenderer.tsx`
- Inspect and remove the ref misuse that is producing:
  `Function components cannot be given refs`
- This is probably not the main blocker, but it is part of the same render path and should be cleaned up while fixing the export.

Files to update
- `src/lib/pdfExport.ts`
- `src/components/quotes/QuotePreview.tsx`
- possibly `src/components/quotes/DocumentLayoutRenderer.tsx`

Expected result
- Clicking “Download PDF” on a quote should start one export, show progress, and reliably save the PDF file to the device instead of silently doing nothing.
