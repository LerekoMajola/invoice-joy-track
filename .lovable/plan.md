

## Plan: SMS Credits, Pagination, and Dashboard Reorder

### 1. Add SMS Credits

Insert SMS credits for account `leekaygroupofcompanies@gmail.com` (user ID: `0ad03a1e-8e32-4f04-88ee-f3c4fde1a25d`) for the current month (February 2026). Trial tier = 10 credits allocated.

### 2. Pagination (10 items per page) for All Document Lists

Add pagination with 10 items per page to these pages:

- **Quotes** (`src/pages/Quotes.tsx`) -- both mobile card view and desktop table
- **Invoices** (`src/pages/Invoices.tsx`) -- both mobile card view and desktop table
- **Delivery Notes** (`src/pages/DeliveryNotes.tsx`) -- both views
- **Workshop/Job Cards** (`src/pages/Workshop.tsx`) -- both views

Each page will get:
- A `currentPage` state starting at 1
- Slice the list to show items `(page-1)*10` through `page*10`
- Previous/Next pagination buttons at the bottom with page indicator (e.g., "Page 1 of 3")
- Reset to page 1 when filters change

### 3. Dashboard Item Reorder (Industry Standard)

Reorder the **Business Dashboard** (`src/pages/BusinessDashboard.tsx`) to follow standard business dashboard conventions:

1. **Date Banner / Greeting** (current position -- keep)
2. **KPI Stats Grid** (current position -- keep)
3. **Quick Actions** (current position -- keep)
4. **Revenue / Financial Summary** -- Recent Invoices card (move up for cash flow visibility)
5. **Pipeline / Sales Activity** -- Recent Quotes card
6. **Tender Source Links** (keep at bottom as reference)

This swaps the order of Recent Quotes and Recent Invoices cards, placing invoices (revenue/cash flow) first, which is the standard priority in business dashboards.

---

### Technical Details

**Pagination pattern** (applied to each document page):

```typescript
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 10;

const paginatedItems = items.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);
const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
```

Pagination controls will use the existing `Button` component with `ChevronLeft`/`ChevronRight` icons, placed below the table/card list.

**Files to modify:**
- `src/pages/Quotes.tsx` -- add pagination
- `src/pages/Invoices.tsx` -- add pagination
- `src/pages/DeliveryNotes.tsx` -- add pagination
- `src/pages/Workshop.tsx` -- add pagination
- `src/pages/BusinessDashboard.tsx` -- reorder Recent Invoices above Recent Quotes

**Data operation:**
- Insert SMS credits row for user `0ad03a1e-...` with 10 credits allocated for `2026-02-01`

