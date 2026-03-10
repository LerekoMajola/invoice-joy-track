

## Show Subscription Due Date on Trial Anniversary

### Problem
The billing page currently treats payments as due on the 1st of each month. The actual billing cycle should align with the trial end date — e.g., if a trial ended March 15, payments are due on the 15th of each subsequent month.

### Changes

**1. PaymentTracker.tsx** — Update `getMonthStatus` logic:
- Extract the anniversary day from `trialEndsAt` (e.g., day 15)
- A month becomes "due" only when the current date reaches the anniversary day of that month (not the 1st)
- A month is "overdue" only after the anniversary day has passed (not after the 1st of the next month)
- Show the due date (e.g., "Due 15th") under each month indicator for clarity

**2. BillingTab.tsx** — Add a "Next Due" column:
- Calculate the next due date from `trial_ends_at` anniversary day
- Show it formatted (e.g., "Mar 15, 2026") in the table
- Replace the less useful "Trial Ended" column with "Next Due"

### Technical Detail

```typescript
// PaymentTracker: derive anniversary day
const anniversaryDay = anniversaryDate ? anniversaryDate.getDate() : 1;

// A month's due date is the anniversary day of that month
const getDueDate = (monthIndex: number) => {
  const lastDay = new Date(currentYear, monthIndex + 1, 0).getDate();
  return new Date(currentYear, monthIndex, Math.min(anniversaryDay, lastDay));
};

// Status uses dueDate instead of monthStart
const getMonthStatus = (monthIndex: number) => {
  // ... N/A check stays same
  const dueDate = getDueDate(monthIndex);
  if (payment?.status === 'paid') return 'paid';
  if (isSameMonth(dueDate, now) && now >= dueDate) return 'due'; // due once anniversary day arrives
  if (isBefore(dueDate, now)) return 'overdue';
  return 'future';
};
```

For BillingTab, the "Next Due" calculation finds the next upcoming anniversary date from today.

