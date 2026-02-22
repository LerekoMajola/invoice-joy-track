
## Auto-Mark Invoice as Paid on Equipment Return

### Overview
When a hire order return is processed, the linked invoice should automatically be updated to "paid" status in addition to the existing total and line item updates.

### Change

**File: `src/hooks/useHireOrders.tsx`** -- `processReturn` mutation

In the section where the linked invoice is found and updated (around line 403-406), change the update to also set `status: 'paid'`:

```text
// Current:
.update({ total: input.adjustedTotal })

// Updated:
.update({ total: input.adjustedTotal, status: 'paid' })
```

This is a one-line change. The invoice status will flip from "draft" to "paid" the moment the return is processed, which will also trigger the existing `notify_invoice_status_change` database function to send a "Payment Received" notification.

No other files or database changes needed.
