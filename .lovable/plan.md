

# Make "Generate Delivery Note" Available on All Invoices

## Problem
The "Generate Delivery Note" button only appears in the dropdown menu for invoices with status "sent" or "paid". It's hidden for "draft" invoices, which is why you don't see it in the screenshot.

## Solution
Move the "Generate Delivery Note" option outside the status-conditional blocks so it appears for every invoice regardless of status, as long as a delivery note hasn't already been generated for it.

## Technical Changes

**File: `src/pages/Invoices.tsx`**

1. **Mobile dropdown (around lines 114-118)**: Move the "Generate Delivery Note" menu item out of the `invoice.status === 'sent'` block and place it as a standalone item available for all statuses.

2. **Desktop dropdown (around lines 451-462)**: Same change -- move the "Generate Delivery Note" item out of both the `sent` and `paid` conditional blocks and make it a single entry that shows for any status when no delivery note exists yet.

Both views will still check `!hasDeliveryNote` / `!invoicesWithDeliveryNotes.has(invoice.id)` to hide the option once a delivery note has already been created.

No database or backend changes needed.
