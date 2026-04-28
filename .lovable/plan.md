## Problem

When migrating tenants come onboard, they already have established document numbering (e.g. their last invoice was `2024-0457` or `INV-1230`). Today the system hard-codes:

- Prefix: `INV-` (invoices), `QT-` (quotes)
- Padding: 4 digits
- Starting number: derived from the latest record, defaulting to `1` for new tenants

A migrating client would be forced to restart at `INV-0001`, which breaks their accounting continuity and confuses their customers.

## Solution

Add per-tenant **Document Numbering Settings** with sensible defaults, configurable from Settings, applied wherever new numbers are generated.

### 1. Database — extend `company_profiles`

Add columns (all nullable, fall back to current defaults):
- `invoice_prefix` (text, default `'INV-'`)
- `invoice_next_number` (int, default `1`)
- `invoice_padding` (int, default `4`)
- `quote_prefix` (text, default `'QT-'`)
- `quote_next_number` (int, default `1`)
- `quote_padding` (int, default `4`)
- `delivery_note_prefix` (text, default `'DN-'`)
- `delivery_note_next_number` (int, default `1`)
- `delivery_note_padding` (int, default `4`)

Storing `next_number` (rather than only "last used") makes the migrating-client setup intuitive: *"Your next invoice will be #…"*.

### 2. Atomic number reservation — RPC

Race-safe number generation via a `SECURITY DEFINER` function:

```sql
reserve_document_number(
  p_company_profile_id uuid,
  p_doc_type text  -- 'invoice' | 'quote' | 'delivery_note'
) RETURNS text
```

It performs a single `UPDATE … RETURNING` that increments `*_next_number` by 1 and returns the formatted string `prefix + padded(current_value)`. This eliminates duplicate-number risk under concurrent creates (today's "fetch latest + 1" is racy).

### 3. Settings UI — new "Document Numbering" card

Located in **Settings → Company** (existing settings page). Three rows (Invoice / Quote / Delivery Note), each with:
- Prefix (text) — e.g. `INV-`, `2025/`, `LXC-INV-`
- Next number (int) — e.g. `1231` for a migrating client
- Padding (1–8) — e.g. `4` → `0042`, `0` → `42`

Live preview underneath: *"Your next invoice will be: `INV-1231`"*.

A friendly hint: *"Migrating from another system? Set Next Number to one above your last issued document."*

### 4. Wire generators to use the RPC

Replace the four existing inline generators with a single helper `generateDocumentNumber(companyProfileId, docType)` that calls the RPC. Edit:
- `src/hooks/useInvoices.tsx` — `generateInvoiceNumber`
- `src/hooks/useQuotes.tsx` — `generateQuoteNumber`
- `src/hooks/useDeliveryNotes.tsx` — equivalent
- `src/components/legal/GenerateInvoiceDialog.tsx` — inline `INV-` builder
- `supabase/functions/process-recurring-documents/index.ts` — `generateNextNumber()` for both invoice and quote

Backwards-compatible: if a company has no settings row yet, the migration fills defaults so existing tenants continue exactly where they are (we'll seed `*_next_number` to `MAX(existing) + 1` per tenant in the same migration).

### 5. Validation guards

- Trying to lower `next_number` below an already-used number → block with toast: *"Number 1230 is already in use."*
- Prefix is freeform but trimmed; empty allowed (e.g. pure numeric `2025-0001`).

### Out of scope (can come later)

- Per-year auto-reset (`{YYYY}` token in prefix)
- Separate sequences for credit notes / receipts
- Bulk renaming of historical documents

## Files Touched

- New migration: add columns + `reserve_document_number` RPC + backfill `next_number` from existing data
- `src/components/settings/` — new `DocumentNumberingCard.tsx`, wired into existing Settings page
- `src/hooks/useInvoices.tsx`, `useQuotes.tsx`, `useDeliveryNotes.tsx`
- `src/components/legal/GenerateInvoiceDialog.tsx`
- `supabase/functions/process-recurring-documents/index.ts`

Approve and I'll implement.