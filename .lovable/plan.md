

## Reorder Navigation Items

Rearranging three navigation entries across the Sidebar, BottomNav, and MoreMenuSheet so the order becomes:

**New order (relevant items):**
1. Quotes
2. Invoices (moved from Shared up to after Quotes)
3. Delivery Notes (moved to after Invoices)
4. ...
5. Staff
6. Profitability (moved from Business section to after Staff)

### Files to update

**1. `src/components/layout/Sidebar.tsx`** -- Reorder the `navigation` array:
- Move `Invoices` entry to right after `Quotes`
- Move `Delivery Notes` to right after `Invoices`
- Move `Profitability` to right after `Staff`

**2. `src/components/layout/BottomNav.tsx`** -- Reorder `allNavItems` to match (Invoices after Quotes in the shared section).

**3. `src/components/layout/MoreMenuSheet.tsx`** -- Reorder `allMenuItems`:
- Move `Profitability` to after `Staff`
- Move `Delivery Notes` to after any Invoices-related context (it's already in the More menu, just reposition)

### Technical details

Only the ordering of items in three static arrays changes. No logic, routing, or module-gating changes needed.

