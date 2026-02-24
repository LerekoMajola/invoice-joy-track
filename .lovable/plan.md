
Goal: make the downloaded invoice PDF look exactly like the on-screen preview (screenshot-like), with no logo skewing.

What I found in the current implementation:
- The download path already uses a high-quality PNG pipeline in `src/lib/pdfExport.ts` (`exportHighQualityPDF`), but it still captures from a cloned offscreen DOM.
- The invoice logo in `src/components/admin/AdminInvoicePreview.tsx` is rendered with `height: 60px` + `width: auto` inside a constrained table cell (`72px` wide). That combination is visually fine in browser preview, but html2canvas can re-resolve the intrinsic ratio differently during offscreen clone capture.
- Current image normalization in `exportHighQualityPDF` is generic (`objectFit`, `display`, `decode`) but does not lock each image to the exact rendered pixel box from the live preview before capture.
- Result: export quality is high, but geometric fidelity for the logo can still drift.

Implementation approach (download only, email unchanged):
1) Make the invoice logo box deterministic in the preview markup
- Update the header logo block in `AdminInvoicePreview` so the logo always renders inside a fixed-size wrapper (explicit width + height), and the image uses `width: 100%`, `height: 100%`, `objectFit: 'contain'`.
- Remove `width: auto` from the invoice logo style.
- Keep visual appearance identical by preserving background, padding, and rounded corners inside this fixed box.
- Add safe fallback to default logo if the custom logo fails to load, so capture always has a stable image node.

2) Replace clone-first PDF capture with “live-element screenshot mode”
- Rework `exportHighQualityPDF` to capture the actual `sourceElement` (the same node shown in preview), not an independently laid-out offscreen clone.
- Keep lossless PNG output and A4 mapping, but drive html2canvas dimensions from `getBoundingClientRect()` + `scrollHeight` of the live element.
- Enable options that preserve screenshot fidelity:
  - high DPR-aware `scale` (capped)
  - `useCORS: true`
  - `backgroundColor: '#ffffff'`
  - `imageTimeout` increased
  - `foreignObjectRendering: true` (for closer browser-like rendering when available)

3) Lock image geometry before capture (critical for skew fix)
- Add a pre-capture image stabilization step in `pdfExport.ts`:
  - collect all `img` nodes inside the export element
  - await full decode/load for each
  - freeze each image to its current rendered pixel box (`style.width/height` from computed dimensions)
  - force `objectFit: contain`, `objectPosition: center`, `transform: none`
- Optional hardening for external images: for the logo, fetch as blob and convert to data URL in-memory before capture so html2canvas reads a same-origin source and cannot reinterpret dimensions due to late network timing.

4) Keep existing high-quality PDF assembly (already good)
- Preserve PNG embedding and multi-page slicing logic in jsPDF.
- Preserve filename and button behavior in `AdminInvoicePreview`.
- Keep email generation path untouched.

5) Add targeted diagnostics for future edge cases
- Add temporary guarded console diagnostics (only in development) around image natural size vs rendered size before capture.
- If mismatch is detected, force a second-pass stabilization before exporting.

Files to update:
- `src/components/admin/AdminInvoicePreview.tsx`
  - deterministic logo container/image sizing in the invoice header
  - optional fallback logo handling for capture stability
- `src/lib/pdfExport.ts`
  - switch to live-element screenshot capture path
  - add strict image geometry stabilization
  - keep PNG + multi-page jsPDF logic

Validation checklist:
- PDF logo proportions match preview exactly for:
  - default logo
  - uploaded PNG logo
  - uploaded JPEG logo
  - wide and square logos
- No stretching/skewing in repeated downloads.
- Table alignment and spacing match preview.
- Text remains sharp and readable.
- Email sending still works exactly as before (unchanged path).

Technical notes:
- This is the closest possible “screenshot-like” export while still producing a downloadable PDF file directly.
- File size may increase slightly due to lossless image handling and stabilized rendering, but visual fidelity should be consistently accurate.
