

# 12-Month Payment Tracker with Automated Reminders

## What You Get
When you click a tenant in the Billing tab, you'll see a 12-month payment calendar with colored indicator lights under each month:
- **Green** = Payment received
- **Red** = Payment overdue (past the due date with no payment)
- **Amber** = Payment due soon (current month, not yet paid)
- **Gray** = Future month (not yet due)

You'll also be able to manually record a payment for any month by clicking on it. Automated reminders will notify both you and the client when payments are late.

## Changes

### 1. New Database Table: `subscription_payments`
Tracks individual monthly payments per subscription:
- `id`, `user_id` (the tenant), `subscription_id`
- `month` (date, first of the month e.g. 2026-01-01)
- `amount`, `payment_date`, `payment_method`, `payment_reference`
- `status` (paid, pending, overdue)
- `created_at`

RLS: Admin can read/write all; users can read their own.

### 2. Billing Tab Gets a Detail View
**File: `src/components/admin/SubscriptionsTab.tsx`**
- Clicking a tenant row opens a detail panel (Sheet) showing:
  - Company name, plan, current status at the top
  - A 12-month grid (current year) with colored dot indicators under each month label (Jan, Feb, Mar...)
  - Click any month to record/edit a payment (amount, date, reference, method)
  - The existing edit subscription controls (plan/status) move into this same panel

### 3. New Component: `PaymentTracker.tsx`
**File: `src/components/admin/PaymentTracker.tsx`**
- Renders the 12-month grid with indicator lights
- Each month shows: short name (Jan, Feb...), a colored circle indicator, and the amount if paid
- Clicking a month opens a small form to record payment
- Fetches from `subscription_payments` table for the selected tenant

### 4. New Edge Function: `check-payment-reminders`
**File: `supabase/functions/check-payment-reminders/index.ts`**
- Runs daily via cron job
- For each active/past_due subscription:
  - Check if the current month has a payment record
  - If no payment and we're past the 5th of the month: send reminder notifications
  - Notify the **admin** (you) with "Payment outstanding from [Company Name] for [Month]"
  - Notify the **client** (the tenant's user_id) with "Your subscription payment for [Month] is outstanding"
- Updates subscription status to `past_due` if payment is more than 7 days late
- Creates both in-app notifications (via the existing `notifications` table)

### 5. Cron Job Setup
- Schedule `check-payment-reminders` to run daily at 8 AM

## Technical Details

### Database Migration
```sql
CREATE TABLE subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  month date NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_date date,
  payment_method text,
  payment_reference text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, month)
);

ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
-- Admin can manage all
-- Users can view their own
```

### Files Created
- `src/components/admin/PaymentTracker.tsx` -- 12-month grid with indicator lights and record payment form
- `supabase/functions/check-payment-reminders/index.ts` -- daily reminder logic

### Files Modified
- `src/components/admin/SubscriptionsTab.tsx` -- add click-to-expand detail view with payment tracker
- `src/components/admin/EditSubscriptionDialog.tsx` -- integrate payment tracker into the dialog
- `supabase/config.toml` -- add the new edge function config

