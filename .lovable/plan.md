

## Fix: Status Still Shows "Past Due" Before Due Date

### Root Cause

Two issues:
1. **BillingTab.tsx** displays the raw `status` from the database without checking whether the anniversary due date has actually passed. The edge function correction hasn't run yet, so stale `past_due` values persist.
2. **Edge function**: Subscriptions with `trial_ends_at: null` (e.g., the owner account with `OWNER-PERPETUAL`) default to day 1, meaning they're always "past due" by the 2nd of the month. Owner/perpetual accounts should be excluded entirely.

### Changes

**1. BillingTab.tsx** — Compute a display status client-side:
- If `trial_ends_at` is null and `payment_reference` is `OWNER-PERPETUAL`, always show "Active"
- Otherwise, calculate the next due date from the anniversary day. If today is before that date, override `past_due` to show "Active" instead
- Use this derived status for the badge and for the summary stats counts

**2. check-payment-reminders edge function** — Skip perpetual/owner subscriptions:
- Filter out subscriptions with `payment_reference = 'OWNER-PERPETUAL'` from all processing
- Also fix the restoration logic: for subs with `trial_ends_at: null`, restore to active since there's no billing anniversary to calculate from

### Technical Detail

```typescript
// BillingTab: derive effective status
const getEffectiveStatus = (sub) => {
  if (sub.payment_reference === 'OWNER-PERPETUAL') return 'active';
  if (sub.status !== 'past_due') return sub.status;
  // If next due date hasn't arrived, it's still active
  const day = sub.trial_ends_at ? new Date(sub.trial_ends_at).getDate() : 1;
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dueDate = new Date(now.getFullYear(), now.getMonth(), Math.min(day, lastDay));
  if (now < dueDate) return 'active';
  return 'past_due';
};
```

