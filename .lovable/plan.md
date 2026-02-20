
## Redesigned Gym Payments Page

### The Problem with the Current Design
The current page shows a flat chronological list of all subscriptions. For a gym with month-to-month billing, this is hard to use because the owner needs to answer one question above all: **"Who has paid this month, and who hasn't?"** A flat list sorted by sign-up date doesn't answer that.

### New Design Concept: Period Navigator

Instead of filtering by "status only", the page will be organized around **billing periods** — months. The owner picks a month (or week), and immediately sees:
- How much was collected in that period
- A clear split: Paid vs Unpaid members
- One-tap "Mark Paid" for outstanding payments

---

### Layout Overview

```text
┌─────────────────────────────────────────────────────┐
│  Gym Payments                                       │
│                                                     │
│  ◄  February 2026  ►        [ Month ▼ ]            │
├──────────────┬──────────────┬──────────────┬────────┤
│  Collected   │  Outstanding │  Total Paid  │ Unpaid │
│  M 12,500    │  M 3,000     │  25 members  │ 6      │
├─────────────────────────────────────────────────────┤
│  [ All ▼ ]  [ Search... ]                          │
├─────────────────────────────────────────────────────┤
│  ● UNPAID (6)                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │ John Doe       Monthly Plan    M500  [Mark Paid]│ │
│  │ Jane Smith     Premium Plan    M800  [Mark Paid]│ │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ✓ PAID (25)                                        │
│  ┌───────────────────────────────────────────────┐  │
│  │ Alice Brown    Monthly Plan    M500  ✓ Paid   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

### Key UX Changes

**1. Period Navigator (top)**
- Left/right arrows to step through months (or weeks if week granularity selected)
- Dropdown to switch between "Monthly" and "Weekly" view
- Defaults to the current month/week on load

**2. Period-aware Stats Bar**
The 4 stat cards will update as you navigate periods:
- **Collected** — sum of `amountPaid` for subscriptions whose `startDate` falls in the selected period
- **Outstanding** — sum of plan price × count for unpaid subscriptions in the period
- **Paid Members** — count with `paymentStatus = 'paid'` in period
- **Unpaid Members** — count with `paymentStatus != 'paid'` in period

**3. Grouped List: Unpaid First, Then Paid**
Instead of one flat list, subscriptions in the selected period are split into two visual sections:
- **Unpaid** section at the top (red/amber accent) — these need action
- **Paid** section below (green/muted) — confirmation of collected payments

Each row shows:
- Member avatar initials chip
- Member name + member number
- Plan name
- Date range (e.g. "1 Feb → 28 Feb")
- Amount
- "Mark Paid" button (unpaid) or green ✓ (paid)

**4. Period Filtering Logic**
A subscription falls into a period if its `startDate` is within that month/week window. For weekly view, the week is Mon–Sun ISO week.

**5. Search still works** — filters within the selected period

---

### Technical Details

**Files to edit:**
- `src/pages/GymPayments.tsx` — full redesign (only this file changes)

**No hook changes needed** — all subscriptions are already fetched. Period filtering is done purely in `useMemo` on the frontend using `startDate`.

**Period logic (Month):**
```typescript
// Selected period: { year: 2026, month: 1 } (0-indexed)
const periodStart = new Date(year, month, 1);
const periodEnd   = new Date(year, month + 1, 0); // last day of month

const inPeriod = subscriptions.filter(s => {
  const d = parseISO(s.startDate);
  return d >= periodStart && d <= periodEnd;
});
```

**Period logic (Week):**
```typescript
// startOfWeek / endOfWeek from date-fns (already installed)
import { startOfWeek, endOfWeek } from 'date-fns';
const ws = startOfWeek(selectedWeekDate, { weekStartsOn: 1 });
const we = endOfWeek(selectedWeekDate, { weekStartsOn: 1 });
```

**Grouped rendering:**
```typescript
const unpaid = inPeriod.filter(s => s.paymentStatus !== 'paid');
const paid   = inPeriod.filter(s => s.paymentStatus === 'paid');
```

**Date-fns functions used** (already installed):
- `startOfWeek`, `endOfWeek`, `startOfMonth`, `endOfMonth`
- `addMonths`, `subMonths`, `addWeeks`, `subWeeks`
- `format`, `parseISO`

---

### What Stays the Same
- `useGymMemberSubscriptions` hook — no changes
- `useGymMembers` hook — no changes
- Navigation wiring (Sidebar, BottomNav, MoreMenu) — no changes
- No database changes required
