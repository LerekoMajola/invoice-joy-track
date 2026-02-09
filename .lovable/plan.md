
# Phase 2 -- Availability Calendar, Returns Tracking, and Hire Order PDF

## Overview

Three features to complete the Tool Hire system: a visual calendar showing equipment bookings, a dedicated returns workflow with condition tracking and damage/late fee calculation, and a printable hire agreement PDF document.

---

## 1. Availability Calendar

### New Page: `/hire-calendar`

A monthly calendar view showing which equipment is booked on which dates. Each day cell shows coloured bars representing active hire orders for each piece of equipment.

**How it works:**
- Fetches all hire orders (active + returned) and their line items
- For each equipment item with active bookings, renders a horizontal bar across the date range on the calendar
- Colour-coded by status: blue for active, red for overdue, green for returned
- Click on an equipment bar to see the order details
- Filter by equipment category or specific item

### New Files

| File | Description |
|------|-------------|
| `src/pages/HireCalendar.tsx` | Calendar page with month navigation, equipment booking bars, and category filter |

### Existing File Changes

| File | Change |
|------|--------|
| `src/App.tsx` | Add route `/hire-calendar` |
| `src/components/layout/Sidebar.tsx` | Add "Availability" nav item with `CalendarDays` icon, moduleKey `hire_calendar`, systemTypes `['hire']` |
| `src/components/layout/BottomNav.tsx` | Add calendar to hire bottom nav |
| `src/components/layout/MoreMenuSheet.tsx` | Add calendar to hire section |
| `src/hooks/useHireOrders.tsx` | Add `fetchOrderItems` query to get all order items for calendar rendering |

### Calendar Layout
- Header: month/year with prev/next navigation
- Grid: 7-column day grid (Mon-Sun)
- Each day cell: stacked coloured bars showing equipment name + order number
- Sidebar or top filter: equipment category dropdown
- Empty days show nothing; days with bookings show compact bars

---

## 2. Returns and Condition Tracking

### New Dialog: `ProcessReturnDialog`

When clicking "Process Return" on an active hire order, a dialog opens showing:

1. **Order summary** -- client, dates, total
2. **Equipment items table** with columns:
   - Equipment name
   - Condition Out (read-only, from when it was sent)
   - Condition In (editable dropdown: excellent/good/fair/poor/damaged)
   - Damage Notes (text input, shown if condition changed or is "damaged")
   - Damage Charge (numeric input)
3. **Late fee calculation** -- if actual return date is after hire_end:
   - Days late = actual_return - hire_end
   - Late fee = days_late * sum(daily_rates * quantities)
   - Shown as a read-only calculated field
4. **Totals section**:
   - Original total
   - Damage charges (sum)
   - Late fees
   - **Adjusted total** (original + damages + late fees)
5. **Confirm Return** button -- updates:
   - `hire_orders.status` to `'returned'`
   - `hire_orders.actual_return_date` to today
   - Each `hire_order_items.condition_in`, `damage_notes`, `damage_charge`
   - `hire_orders.total` to adjusted total (if damages/late fees apply)

### New Files

| File | Description |
|------|-------------|
| `src/components/hire/ProcessReturnDialog.tsx` | Full return workflow dialog |

### Existing File Changes

| File | Change |
|------|--------|
| `src/pages/HireOrders.tsx` | Add "Process Return" button on active/overdue order cards. Add click handler to open return dialog. Add order detail view (clicking on an order card opens a detail panel or expands to show items). |
| `src/hooks/useHireOrders.tsx` | Add `fetchOrderItems(orderId)` query. Add `processReturn` mutation that updates order status, actual_return_date, and all item conditions/charges in a single flow. Also invalidate equipment queries so availability updates. |

### Late Fee Logic
```
daysLate = max(0, differenceInDays(actualReturnDate, hireEnd))
dailyTotal = sum(item.daily_rate * item.quantity) for all items
lateFee = daysLate * dailyTotal
```

---

## 3. Hire Order PDF / Preview

### New Component: `HireOrderPreview`

A full-screen overlay (using React Portal, same pattern as InvoicePreview and DeliveryNotePreview) that renders the hire agreement as an A4 document.

**Document sections (marked with `data-pdf-section`):**

1. **Header** -- company logo, name, address (using `DocumentHeader` from `DocumentLayoutRenderer`)
2. **Agreement Details** -- order number, client name, phone, hire dates, deposit paid
3. **Equipment Table** -- columns: Item, Qty, Daily Rate, Condition Out, Subtotal
4. **Totals** -- subtotal, deposit, balance due
5. **Terms and Conditions** -- from company profile `default_terms` or a hire-specific default
6. **Signatures** -- two signature lines: "For Company" and "Customer Acknowledgment"

**Actions bar (top, hidden on print):**
- Download PDF (using `exportSectionBasedPDF`)
- Print
- Template selector (reuse `TemplateSelector` component)
- Close

### New Files

| File | Description |
|------|-------------|
| `src/components/hire/HireOrderPreview.tsx` | Full hire agreement preview with PDF export and print support |

### Existing File Changes

| File | Change |
|------|--------|
| `src/pages/HireOrders.tsx` | Add "View Agreement" button on order cards. When clicked, open `HireOrderPreview` overlay. |

---

## Database Changes

No new tables or columns needed. All required fields (`condition_in`, `damage_notes`, `damage_charge`, `actual_return_date`) already exist in the schema from Phase 1.

---

## Navigation Updates Summary

Add to sidebar/bottom nav/more menu:
- "Availability" with `CalendarDays` icon at `/hire-calendar` (moduleKey: `hire_calendar`)

Add to `App.tsx`:
- Route `/hire-calendar` pointing to `HireCalendar` page

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/HireCalendar.tsx` | **New** -- availability calendar page |
| `src/components/hire/ProcessReturnDialog.tsx` | **New** -- returns workflow dialog |
| `src/components/hire/HireOrderPreview.tsx` | **New** -- printable hire agreement preview |
| `src/hooks/useHireOrders.tsx` | Update -- add `fetchOrderItems`, `processReturn` mutation |
| `src/pages/HireOrders.tsx` | Update -- add return/preview buttons, order detail expansion |
| `src/App.tsx` | Update -- add `/hire-calendar` route |
| `src/components/layout/Sidebar.tsx` | Update -- add Availability nav item |
| `src/components/layout/BottomNav.tsx` | Update -- add calendar to hire nav |
| `src/components/layout/MoreMenuSheet.tsx` | Update -- add calendar to hire section |

## Technical Details

### HireCalendar.tsx
- Uses a custom month grid (not react-day-picker, since we need multi-day bars)
- `startOfMonth` / `endOfMonth` from date-fns to build the grid
- Each booking renders as a coloured div spanning the relevant days
- Equipment items fetched via `useEquipment()`, orders via `useHireOrders()`, items via a new `useHireOrderItems()` query or inline fetch

### ProcessReturnDialog.tsx
- Receives `order: HireOrder` as prop
- Fetches order items on mount via `useHireOrders().getOrderItems(orderId)`
- Local state for each item's `condition_in`, `damage_notes`, `damage_charge`
- Calculates late fees automatically from dates
- On confirm, calls `processReturn` mutation with all data

### HireOrderPreview.tsx
- Uses `createPortal` to render into `document.body` (same as DeliveryNotePreview)
- Uses `DocumentHeader`, `DocumentWrapper`, `DocumentFooter` from `DocumentLayoutRenderer`
- `exportSectionBasedPDF` for PDF download
- `window.print()` for printing with `@media print` CSS hiding the action bar
- Template selection via `TemplateSelector` component for consistent branding
