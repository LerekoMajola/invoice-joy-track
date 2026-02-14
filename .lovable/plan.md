
# Split Recent Quotes to Add Recent Invoices

## What Changes
The current full-width "Recent Quotes" card will be split into a two-column grid layout, with "Recent Quotes" on the left and a new "Recent Invoices" card on the right. Both cards will show the 5 most recent items.

## Layout Change
- Currently: One full-width "Recent Quotes" card
- After: A `grid grid-cols-1 md:grid-cols-2 gap-4` row containing:
  - **Recent Quotes** (left) -- same content, limited to 5 items
  - **Recent Invoices** (right) -- new card showing the 5 most recent invoices with invoice number, status badge, client name, and amount

## Technical Details

**File modified:** `src/pages/BusinessDashboard.tsx`

1. Add a `recentInvoices` memo (similar to `recentQuotes`) that sorts invoices by date descending and takes the top 5.

2. Add invoice-specific status styles (draft, sent, paid, overdue) to the existing `statusStyles` object -- the current styles already cover these statuses.

3. Wrap the "Recent Quotes" card and a new "Recent Invoices" card inside a two-column grid:
   - Each card renders items identically: number, status badge, client name, and amount
   - The invoices card uses the `Receipt` icon (already imported) and navigates to `/invoices` on click

No new files, no new dependencies, no database changes required.
