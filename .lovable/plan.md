

## Fix Admin Invoice PDF — Eliminate Skewing, Pixelation, and Misalignment

### Problem
The AdminInvoicePreview generates PDFs using `html2canvas`, which has poor support for CSS `display: flex` and `display: grid`. This causes:
- **Skewed layout** in the "Bill To / Invoice Details" side-by-side section (uses `display: flex`)
- **Misaligned totals** section (uses `display: flex` with `justify-content: flex-end`)
- **Broken banking details grid** (uses `display: grid` with `gridTemplateColumns`)
- **Subtotal/Tax/Total rows** misaligned (uses `display: flex` with `justify-content: space-between`)

### Solution
Replace all `display: flex` and `display: grid` usages inside the PDF-captured container (`contentRef`) with HTML `<table>` elements. Tables are the most reliably rendered layout by `html2canvas`.

### File: `src/components/admin/AdminInvoicePreview.tsx`

**Changes (all within the `contentRef` div, lines 232-353):**

1. **Bill To and Invoice Details (line 232)** — Replace the `display: flex` wrapper with a two-column `<table>` layout so both cards sit side-by-side reliably.

2. **Totals section (lines 293-310)** — Replace the outer `display: flex` (right-aligned) with a right-aligned `<table>`. Replace inner flex rows (Subtotal, Tax, Total Due) with `<tr>` rows containing left-aligned label and right-aligned amount `<td>` cells.

3. **Banking Details grid (line 317)** — Replace `display: grid` with a 2-column `<table>` with two rows (Bank/Branch, Account/Reference).

4. **PDF generation settings** — Add `imageTimeout: 15000` to the `html2canvas` options in both `generatePDFBase64` and `handleDownloadPDF` to ensure the logo fully loads before capture. Also add `height: el.scrollHeight` to capture the full content.

### What stays the same
- The visual design, colors, fonts, and spacing remain identical
- The header already uses `<table>` (no change needed)
- The line items table is already a proper `<table>` (no change needed)
- The POP instruction, notes, payment confirmation, and footer sections use simple block layout (no change needed)

### Result
The on-screen preview will look exactly the same, and the downloaded/emailed PDF will match the preview pixel-for-pixel with no skewing or misalignment.
