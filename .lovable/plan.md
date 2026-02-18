
## Fix: Subscription Status Not Updating After Payment

### The Problem
When you record a payment for a tenant in the Payment Tracker, the payment is saved but the subscription status stays as "past_due". The `check-payment-reminders` function automatically marks unpaid subscriptions as "past_due" after the 7th of the month, but nothing reverses it when payment comes in.

### The Fix

**1. Update E-Legal's status right now**
Run a data update to set E-Legal Solutions Inc's subscription status from "past_due" back to "active" since their February payment is already recorded.

**2. Auto-restore status on payment recording**
Modify `src/components/admin/PaymentTracker.tsx` so that when a payment is recorded for the current month, the subscription status is automatically set back to "active" (if it was "past_due"). This goes in the `upsertMutation` success handler -- after saving the payment, update the subscription status.

### Technical Details

**File: `src/components/admin/PaymentTracker.tsx`**
- After the insert/update of a payment record, add a follow-up query:
  - Check if the payment month matches the current month
  - If so, update the subscription's status to "active" (only if currently "past_due")
- This ensures future payments automatically fix the status without manual intervention

**Data fix (one-time):**
- UPDATE the subscriptions table to set E-Legal's status to "active"
