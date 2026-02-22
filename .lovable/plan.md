

## Edit Hire Orders + Validation + Show Equipment on Cards

### 1. Show Equipment on Order Cards

Each hire order card currently only shows order number, client, total, and dates. We will display the equipment items directly on each card by looking them up from the `allOrderItems` array (already fetched in `useHireOrders`).

Below the client name, a list of equipment names with quantities will be shown, e.g.:
- "Excavator x2, Generator x1"

### 2. Add Edit Hire Order Dialog

Add an "Edit" button on each order card (only for `active` or `draft` status). Clicking it opens a dialog pre-populated with the order's current data (client, dates, deposit, notes) and its equipment items.

The edit dialog will:
- Load existing order items via `getOrderItems()`
- Allow changing client, dates, deposit, notes
- Allow adding/removing/changing equipment items
- Recalculate the total on save
- Call a new `editOrder` mutation that updates the `hire_orders` row and replaces all `hire_order_items` (delete old, insert new)
- Also update the linked draft invoice (same pattern as create)

### 3. Stricter Validation (Create + Edit)

The "Create Order" and "Save" buttons will be disabled unless:
- Client name is filled
- Start and end dates are filled
- At least one equipment item is added
- Every equipment item has an equipment selected (non-empty `equipment_item_id`)
- Total is greater than 0

### Technical Changes

**File: `src/pages/HireOrders.tsx`**
- Import `Pencil` icon from lucide-react
- Use `allOrderItems` from `useHireOrders` to show equipment names on each card
- Add `editOpen` and `editingOrder` state variables
- Add an "Edit" button on cards with `active`/`draft` status
- When edit is clicked, load order items and populate the form
- Reuse the same form fields for both create and edit (via a shared dialog or conditional title)
- Add validation: disable submit if `orderItems.length === 0` or any item has empty `equipment_item_id` or `calculateTotal() <= 0`

**File: `src/hooks/useHireOrders.tsx`**
- Add a new `editOrder` mutation that:
  1. Updates `hire_orders` row (client_name, client_id, client_phone, hire_start, hire_end, deposit_paid, total, notes)
  2. Deletes all existing `hire_order_items` for that order
  3. Inserts the new items
  4. Finds and updates the linked invoice + line items (same pattern as create)
- Export `editOrder` from the hook

