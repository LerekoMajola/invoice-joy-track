
## Hybrid Invoice: Draft on Creation + Update on Return

### What Changes

**File: `src/hooks/useHireOrders.tsx`** -- `processReturn` mutation

After updating the hire order status and item conditions, add logic to find and update the linked draft invoice:

1. **Find the linked invoice** by matching `description = 'Hire Order HO-XXX'` for the order's `order_number`
2. **Recalculate actual hire days** using `hire_start` to `actualReturnDate` (instead of the original `hire_end`)
3. **Calculate total damage charges** from the returned items
4. **Update the invoice** total to `adjustedTotal` (which already includes damage charges from the ProcessReturnDialog)
5. **Delete old line items** and **insert new ones** reflecting:
   - Actual days rented per equipment item
   - A separate "Damage charge" line item if any damage charges exist
6. **Invalidate the invoices cache** so the Invoices page reflects the update

### Technical Details

In `processReturn.mutationFn`, after the existing item updates (around line 274), add:

```text
1. Query: SELECT * FROM invoices WHERE description = 'Hire Order {orderNumber}'
2. If found:
   a. UPDATE invoice SET total = adjustedTotal
   b. DELETE FROM invoice_line_items WHERE invoice_id = found.id
   c. INSERT new line items with actual days and damage charges
3. Invalidate ['invoices'] query cache in onSuccess
```

The `order_number` is retrieved by querying the hire order being returned. The `adjustedTotal` is already passed from the ProcessReturnDialog and includes any damage/late fees.

No database changes needed -- uses existing `invoices` and `invoice_line_items` tables.
