

# Payment Recording and Receipt Generation for Invoices

## Overview
When marking an invoice as paid, the system will now capture payment details (method, date, reference number) and allow generating a downloadable "Proof of Payment" / "Receipt" document.

## What Changes

### 1. Database: Add payment columns to `invoices` table
Add three new columns to store payment information:
- `payment_method` (text, nullable) -- e.g., "cash", "bank_transfer", "mobile_money", "cheque"
- `payment_date` (date, nullable) -- when payment was received
- `payment_reference` (text, nullable) -- receipt or reference number

### 2. "Mark as Paid" becomes a dialog instead of a simple button
Currently clicking "Mark as Paid" immediately changes the status. Instead, it will open a **Record Payment Dialog** that collects:
- Payment method (Cash, Bank Transfer, Mobile Money, Cheque)
- Payment date (defaults to today)
- Reference number (optional)

Once submitted, the invoice status changes to "paid" and the payment details are saved.

### 3. Invoice interface and hook updates
- Add `paymentMethod`, `paymentDate`, `paymentReference` to the `Invoice` interface in `useInvoices.tsx`
- Map the new DB columns in fetch/update logic

### 4. Receipt / Proof of Payment document
Add a new `ReceiptPreview` component that renders a professional receipt document (using the same template system as invoices/quotes) showing:
- "RECEIPT" / "PROOF OF PAYMENT" title
- Receipt number (based on invoice number, e.g., "REC-0001")
- Company branding (logo, address, etc.)
- Client name and details
- Invoice reference number
- Amount paid
- Payment method and reference
- Payment date
- "PAID" watermark/stamp

This can be downloaded as PDF, just like invoices.

### 5. UI additions on the Invoices page
- For paid invoices, show a "Download Receipt" button in the actions menu and in the invoice preview
- Show payment details (method, date, reference) on the invoice preview when the invoice is paid

## Files to Change

| File | Change |
|------|--------|
| **Migration** | Add `payment_method`, `payment_date`, `payment_reference` columns to `invoices` |
| `src/hooks/useInvoices.tsx` | Add new fields to `Invoice` interface, map in fetch/update |
| `src/components/invoices/RecordPaymentDialog.tsx` | **New file** -- dialog to capture payment details when marking as paid |
| `src/components/invoices/ReceiptPreview.tsx` | **New file** -- receipt/proof of payment document with PDF export |
| `src/components/invoices/InvoicePreview.tsx` | Show payment info section when paid; add "Download Receipt" button |
| `src/pages/Invoices.tsx` | Replace direct status change with RecordPaymentDialog; add receipt viewing |

## Technical Details

### New columns (migration):
```sql
ALTER TABLE invoices ADD COLUMN payment_method text;
ALTER TABLE invoices ADD COLUMN payment_date date;
ALTER TABLE invoices ADD COLUMN payment_reference text;
```

### RecordPaymentDialog
- Similar pattern to the existing `RecordPaymentDialog` used in school fees
- Payment methods: Cash, Bank Transfer, Mobile Money, Cheque
- On submit: calls `updateInvoice` with status "paid" plus payment fields

### ReceiptPreview component
- Uses the same `DocumentLayoutRenderer` components (DocumentHeader, DocumentWrapper, DocumentFooter, etc.) for consistent branding
- Shows a "PAID" stamp/badge prominently
- Includes: receipt number, payment date, payment method, reference, amount paid, invoice reference
- PDF download via html2pdf (same approach as InvoicePreview)

### Flow change for "Mark as Paid"
```
Before: Click "Mark as Paid" -> status changes immediately
After:  Click "Mark as Paid" -> RecordPaymentDialog opens -> user fills payment details -> submit -> status changes + payment recorded
```
