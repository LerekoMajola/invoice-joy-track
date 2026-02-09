

# Add Quantity/Stock Tracking to Equipment Catalogue

## Problem

Currently, each row in the equipment catalogue represents a single physical unit. If you own 10 identical generators, you'd have to create 10 separate entries. This doesn't scale for bulk or commodity items.

## Solution

Add a `quantity_total` field to each equipment item so you can say "I have 10 of these." The system will then track how many are currently on hire and show availability accordingly.

## Database Change

Add one column to `equipment_items`:
- `quantity_total` (integer, default 1) -- total units of this item you own

No new tables needed. The number currently on hire is calculated at query time from active `hire_order_items`.

## How Availability Works

- **Total owned**: `quantity_total` on the equipment item
- **Currently on hire**: SUM of `quantity` from `hire_order_items` where the parent `hire_order` status is `'active'`
- **Available**: Total owned minus currently on hire
- **Status logic**: If available > 0, item is still bookable. If available = 0, show as fully booked.

## UI Changes

### Equipment Catalogue (Equipment.tsx)
- Add "Qty Owned" field in the Add Equipment dialog (default 1)
- Show stock info on each equipment card: "3 of 5 available" or "In Stock: 3"
- The existing status badge adapts: if all units are on hire, show "Fully Booked"; if some available, show "Available (3/5)"

### Hire Orders (HireOrders.tsx)
- When selecting equipment for an order, show available quantity next to each item in the dropdown
- Validate that requested quantity does not exceed available stock
- Grey out or hide equipment with 0 available

### Equipment Hook (useEquipment.tsx)
- Fetch active hire counts alongside equipment data using a query that joins/counts from `hire_order_items` + `hire_orders`
- Expose `available_quantity` as a computed field on each equipment item

## Files

| File | Action |
|------|--------|
| Database migration | Add `quantity_total` column to `equipment_items` |
| `src/hooks/useEquipment.tsx` | Add available quantity calculation, update `CreateEquipmentInput` |
| `src/pages/Equipment.tsx` | Add quantity field to form, show stock levels on cards |
| `src/pages/HireOrders.tsx` | Show available stock in equipment picker, validate quantity |
| `src/pages/HireDashboard.tsx` | Update stats to reflect total units vs items on hire |

## Technical Details

### Migration SQL
```sql
ALTER TABLE public.equipment_items
  ADD COLUMN quantity_total integer NOT NULL DEFAULT 1;
```

### Available Quantity Calculation (useEquipment.tsx)
After fetching equipment, run a second query to get on-hire counts:
```sql
SELECT hoi.equipment_item_id, SUM(hoi.quantity) as on_hire
FROM hire_order_items hoi
JOIN hire_orders ho ON ho.id = hoi.hire_order_id
WHERE ho.status = 'active'
GROUP BY hoi.equipment_item_id
```
Then merge into each equipment item: `available = quantity_total - on_hire`.

### Equipment Card Display
Replace the simple status badge with stock-aware display:
- `quantity_total = 1`: Show status as-is (single-unit tracking)
- `quantity_total > 1`: Show "Available: X / Y" with a progress-style indicator

### Hire Order Validation
When adding items to an order, check `available >= requested_quantity` before allowing submission. Show inline warning if user tries to over-book.

