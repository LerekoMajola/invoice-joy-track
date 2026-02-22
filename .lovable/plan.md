

## Monthly Gym Invoice Emails (20th of Every Month)

### Overview
A scheduled backend function will run on the 20th of every month and automatically email an invoice to each active gym member with an active subscription. The email will include the member's name, plan details, amount due, and payment period.

### How It Works

1. A new backend function (`send-gym-invoices`) runs on the 20th of each month via a scheduled job
2. It queries all active gym members who have active subscriptions
3. For each member with an email address, it sends a professional invoice email via Resend showing their plan name, amount, and billing period
4. A log record is kept to avoid sending duplicate invoices in the same month

### Technical Details

**New Database Table: `gym_invoice_logs`**
Tracks which invoices have been sent to prevent duplicates if the function runs more than once in a month:
- `id` (uuid)
- `user_id` (uuid) -- gym owner
- `company_profile_id` (uuid)
- `member_id` (uuid) -- references gym_members
- `subscription_id` (uuid) -- references gym_member_subscriptions
- `billing_month` (text) -- e.g. "2026-02"
- `sent_at` (timestamptz)
- RLS policy: users can read their own logs

**New Edge Function: `supabase/functions/send-gym-invoices/index.ts`**
- Accepts a POST request (triggered by cron)
- Queries all `gym_member_subscriptions` with `status = 'active'`
- Joins `gym_members` (for name/email) and `gym_membership_plans` (for plan name/price)
- Joins `company_profiles` (for gym business name, bank details, logo)
- Skips members without an email address
- Checks `gym_invoice_logs` to skip already-sent invoices for the current month
- Sends a branded invoice email to each member via Resend
- Logs each successful send to `gym_invoice_logs`

**Scheduled Job (pg_cron)**
A cron job scheduled for `0 8 20 * *` (8:00 AM on the 20th of every month) that calls the edge function.

**Email Content**
Each email will include:
- Gym/business name and logo (from company profile)
- Member name and member number
- Plan name and monthly amount
- Billing period (current month)
- Bank payment details (from company profile)
- A note that payment is due by end of month

**Config Update: `supabase/config.toml`**
Add `[functions.send-gym-invoices]` with `verify_jwt = false` (called by cron).

### Files Changed
1. **Database migration** -- create `gym_invoice_logs` table with RLS
2. **`supabase/functions/send-gym-invoices/index.ts`** -- new edge function
3. **`supabase/config.toml`** -- add function config (auto-managed)
4. **pg_cron job** -- schedule the monthly trigger

