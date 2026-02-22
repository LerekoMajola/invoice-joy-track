

## Auto-Create Invoice on Hire Order Creation

### Overview
When a hire order is successfully created, the system will automatically generate a corresponding draft invoice with all the hire order line items.

### Changes

**Single file change: `src/hooks/useHireOrders.tsx`**

Inside the `createOrder` mutation, after hire order items are inserted:

1. Query the latest invoice number to generate the next sequential one (e.g. INV-0045)
2. Insert a new `invoices` row with:
   - Same `user_id`, `company_profile_id`, `client_id`, `client_name`
   - `date` = today, `due_date` = today + 30 days
   - `total` = order total, `tax_rate` = 0, `status` = 'draft'
   - `description` = "Hire Order HO-XXX"
3. Insert `invoice_line_items` for each equipment item with description like "Excavator (5 days @ 200/day)", quantity, and unit_price = daily_rate x days
4. Wrap in try/catch so invoice failure does not block the hire order
5. Invalidate the `invoices` query cache
6. Update success toast to "Hire order created & invoice generated"

No database migration needed -- uses existing `invoices` and `invoice_line_items` tables.

