
## Gym Payments Page

### What's Being Built

A dedicated **Gym Payments** page at `/gym-payments` — the gym owner's central view of all member subscription payments. This mirrors what the School Fees page does for schools: one place to see total revenue collected, who has paid, who still owes, and a full payment history list.

### Page Layout

```text
┌──────────────────────────────────────────────┐
│  Gym Payments                                │
│  All member subscription payments            │
├───────────┬──────────────┬───────────────────┤
│ Revenue   │  Paid        │  Pending/Overdue  │
│ This Mo.  │  Count       │  Count            │
├──────────────────────────────────────────────┤
│  [ All Statuses ▼ ]  [ Search... ]           │
├──────────────────────────────────────────────┤
│  Member        Plan        Amount  Status    │
│  John Doe      Ball Breaker  1,000  Paid     │
│  Jane Smith    Monthly        500   Pending  │
│  ...                                         │
└──────────────────────────────────────────────┘
```

### Stats Cards (top row)
- **Revenue This Month** — sum of `amountPaid` for subscriptions created this calendar month
- **Total Paid** — count of subscriptions with `paymentStatus = 'paid'`
- **Pending / Overdue** — count of subscriptions where `paymentStatus` is `pending` or `overdue`
- **All-Time Revenue** — total sum of all `amountPaid` regardless of date

### Payment List
Each row shows:
- Member name (linked to member record)
- Plan name
- Subscription dates (start → end)
- Amount paid
- Payment status badge (Paid / Pending / Overdue)
- Subscription status badge (Active / Frozen / Expired / Cancelled)

Filters:
- Payment status filter (All / Paid / Pending / Overdue)
- Search by member name or plan

### Update Payment Status
Owners can tap a "Mark Paid" button on pending subscriptions directly from this list — no need to drill into the member detail dialog.

### Navigation Wiring
The page needs to appear in three places:
1. **Sidebar** (`src/components/layout/Sidebar.tsx`) — add `Gym Payments` entry for `gym` system type with `gym_members` module key
2. **Bottom Nav** (`src/components/layout/BottomNav.tsx`) — add as `Payments` item for `gym` system type
3. **More Menu** (`src/components/layout/MoreMenuSheet.tsx`) — add for overflow on mobile
4. **App Router** (`src/App.tsx`) — register `/gym-payments` route

### Technical Details

**New files:**
- `src/pages/GymPayments.tsx` — the main page component

**Modified files:**
- `src/App.tsx` — add route `/gym-payments`
- `src/components/layout/Sidebar.tsx` — add nav item
- `src/components/layout/BottomNav.tsx` — add to gym bottom nav items
- `src/components/layout/MoreMenuSheet.tsx` — add to more menu

**Hook reuse:** The page reuses the existing `useGymMemberSubscriptions()` (called without a `memberId` so it fetches all subscriptions) and `useGymMembers()` to resolve names. No new hook or database changes required — all data already exists.

**Update payment status:** Add a `updateSubscription` function to `useGymMemberSubscriptions` that does a simple `UPDATE` on `gym_member_subscriptions` by id — used to mark pending payments as paid.

No schema changes needed. All data is already captured when plans are assigned via `AssignPlanDialog`.
