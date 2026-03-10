

## Fix: Align Status with Next Due Date

### Problem
`getEffectiveStatus` calculates the due date for the current month only. For Ideliver (day 5) and MISFIT (day 3), the March due dates have passed, so it shows "Past Due". But the "Next Due" column correctly shows April 5 / April 3 — a future date. The status should only be "Past Due" once the **next upcoming** due date has passed.

### Fix

Update `getEffectiveStatus` in `BillingTab.tsx` to use the same next-due-date logic as the "Next Due" column:

```typescript
function getEffectiveStatus(sub: NonNullable<Tenant['subscription']>): string {
  if (sub.payment_reference === 'OWNER-PERPETUAL') return 'active';
  if (sub.status !== 'past_due') return sub.status;
  if (!sub.trial_ends_at) return sub.status;
  
  const day = new Date(sub.trial_ends_at).getDate();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  let nextDue = new Date(year, month, Math.min(day, lastDay));
  
  // If this month's due date has passed, next due is next month
  if (nextDue <= now) {
    const nm = month + 1 > 11 ? 0 : month + 1;
    const ny = month + 1 > 11 ? year + 1 : year;
    const ld = new Date(ny, nm + 1, 0).getDate();
    nextDue = new Date(ny, nm, Math.min(day, ld));
  }
  
  // If next due is in the future, they're not past due yet
  return now < nextDue ? 'active' : 'past_due';
}
```

This ensures the status badge matches the "Next Due" column — if the next due date hasn't arrived, the tenant is still "Active".

### Files
| File | Change |
|------|--------|
| `src/components/admin/BillingTab.tsx` | Update `getEffectiveStatus` to use next-due-date logic |

