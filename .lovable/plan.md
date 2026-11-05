# Invoice PDF matches the screen

## Problem
Invoice downloads use the old PDF library. When the invoice is open for editing, the dates, PO number and other fields are entry boxes, and the old library leaves them blank in the PDF.

## Fix
1. Switch invoice download to the same exporter that now works for statements and quotes (with "Open PDF" fallback and clear messages).
2. Before capturing, briefly show the invoice in view mode (plain text for dates, due date, PO number, item lines, notes), then capture, then return to editing. The PDF then matches what is on screen, without edit borders or buttons.
3. Apply the same fix to the receipt download.

## Technical details
- `InvoicePreview.tsx`: replace `html2pdf` in `handleDownloadPDF` with `exportHighQualityPDF(previewRef.current, filename)`; set a `isCapturing` flag that renders the non-editing branch (`isEditing && !isCapturing`), await two animation frames, export, reset in `finally`.
- Hide edit-only controls (add/remove item buttons) while capturing.
- `ReceiptPreview.tsx`: same exporter swap.
- Verify by downloading an invoice in edit mode and checking date/due date/PO appear.
