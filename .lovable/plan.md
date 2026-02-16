

# Plan: Anniversary-Based Payment Tracker and Staff Limit

## What's Changing

### 1. Payment Tracker Starts from Anniversary Month
Currently the payment tracker always shows January through December, treating every month as trackable. The problem (visible in the screenshot) is that months before the subscription actually started show as "Overdue" even though no payment was expected.

**Fix:** The PaymentTracker will receive the `trial_ends_at` date as a new prop. Months before the anniversary month will be treated as "N/A" (not applicable) instead of "Overdue" or "Due". The tracker will only show payment expectations starting from the month the trial ended and the real subscription began.

For example, if a tenant's trial ends on February 20, 2026, then:
- January = N/A (greyed out, not clickable)
- February = the first month a payment is expected (anniversary month)
- March onward = normal tracking

### 2. Staff Limit of 5 Members
All system types will be limited to a maximum of 5 staff members. When a tenant tries to add a 6th staff member, they will see an error message and the action will be blocked.

---

## Technical Details

### File: `src/components/admin/PaymentTracker.tsx`
- Add a new `trialEndsAt` prop (string or null) to `PaymentTrackerProps`
- Update `getMonthStatus()`: if a month is before the anniversary month, return a new `'na'` status
- Add an `'na'` indicator style (fully greyed out, not clickable)
- Disable click on N/A months just like future months

### File: `src/components/admin/SubscriptionsTab.tsx`
- Pass `tenant.subscription.trial_ends_at` to the `PaymentTracker` component as the new `trialEndsAt` prop

### File: `src/hooks/useStaff.tsx`
- In `createStaff()`, check the current staff count before inserting
- If count >= 5, show a toast error ("Staff limit reached. Maximum 5 staff members allowed.") and return null

### File: `src/components/staff/AddStaffDialog.tsx`
- Accept staff count from the hook and disable the submit button when the limit is reached
- Show a visible warning message when at the limit

### File: `supabase/functions/check-payment-reminders/index.ts`
- Update the reminder logic to skip months before the anniversary month when determining if a payment is "outstanding"

