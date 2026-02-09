

# Legal Dashboard -- Live Data Integration

## Overview
Transform the Legal Dashboard from static placeholders into a fully data-driven dashboard that reflects all core legal practice management modules: cases, time tracking, billing, calendar, and financial overview.

## What Changes

### New Hooks (3 files)

1. **`src/hooks/useLegalCases.tsx`** -- Fetch all `legal_cases` for the current user. Returns cases array, loading state, and CRUD mutations (add, update, delete).

2. **`src/hooks/useLegalTimeEntries.tsx`** -- Fetch all `legal_time_entries` for the current user. Returns entries array, loading state, and add/update/delete mutations.

3. **`src/hooks/useLegalCalendar.tsx`** -- Fetch all `legal_calendar_events` for the current user. Returns events array, loading state, and CRUD mutations.

### Updated Dashboard: `src/pages/LegalDashboard.tsx`

Replace all placeholder content with live data from the three new hooks plus existing `useInvoices` hook.

#### 1. Stats Cards (live numbers)

| Card | Source | Calculation |
|------|--------|-------------|
| Active Cases | `legal_cases` | Count where status is `open` or `in_progress` |
| Unbilled Hours | `legal_time_entries` | Sum of `hours` where `is_billable = true` AND `is_invoiced = false` |
| Revenue This Month | `invoices` | Sum of `total` where `status = 'paid'` and date is in current month |
| Upcoming Hearings | `legal_calendar_events` | Count where `event_type = 'hearing'` and `event_date >= today` and `is_completed = false` |

#### 2. Quick Actions (unchanged, already wired)

New Case, Log Time, Court Calendar, Documents buttons stay as-is.

#### 3. Recent Cases card (live data)

- Show the 5 most recently created/updated cases
- Each row shows: case number, title, status badge (color-coded), case type, and priority
- Clickable to navigate to `/legal-cases`
- Empty state if no cases

#### 4. Upcoming Deadlines card (live data)

- Show the next 5 upcoming `legal_calendar_events` (sorted by date ascending, future only, not completed)
- Each row shows: title, event type badge, date, linked case title (if any)
- Color-coded by priority and how close the deadline is (red if within 2 days, amber within 7, green otherwise)
- Empty state if none

#### 5. NEW: Today's Time Log (new section)

- Show time entries logged today with case name, hours, and description
- Total hours today displayed prominently
- Quick "Log Time" button

#### 6. NEW: Financial Overview card (new section)

- Outstanding fees: sum of unpaid invoice totals (status = sent or overdue)
- Revenue this month: already calculated for stat card, reuse
- Total billable value: sum of unbilled hours x hourly rate
- Simple 3-metric display

#### 7. NEW: Cases by Status breakdown (small visual)

- Mini horizontal bar or pill badges showing count per status: Open, In Progress, On Hold, Closed
- Quick visual of workload distribution

## Layout Structure

```text
[Date Banner]
[Stats: Active Cases | Unbilled Hours | Revenue | Hearings]
[Quick Actions]
[Recent Cases          |  Upcoming Deadlines    ]
[Today's Time Log      |  Financial Overview    ]
[Cases by Status (full width)]
```

## Technical Details

- All three hooks follow existing patterns (e.g., `useClients`, `useInvoices`): `useQuery` from TanStack React Query, Supabase select with `order by`, return typed arrays
- Stats computed via `useMemo` to avoid re-renders
- Status badge colors: open = emerald, in_progress = blue, on_hold = amber, closed = gray, archived = slate
- Priority colors: high = red, medium = amber, low = green
- Currency formatting uses existing `formatMaluti()` helper
- No new database changes needed -- all tables already exist from the prior migration

## Files Summary

| File | Action |
|------|--------|
| `src/hooks/useLegalCases.tsx` | **Create** -- CRUD hook for `legal_cases` |
| `src/hooks/useLegalTimeEntries.tsx` | **Create** -- CRUD hook for `legal_time_entries` |
| `src/hooks/useLegalCalendar.tsx` | **Create** -- CRUD hook for `legal_calendar_events` |
| `src/pages/LegalDashboard.tsx` | **Rewrite** -- Replace placeholders with live data sections |

