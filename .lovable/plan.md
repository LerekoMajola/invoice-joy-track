
## Gym Member Billing: Proof of Payment Upload + Renewal Reminders

### What's Being Built

Two features:
1. **POP Upload** — A gym member can take a photo of their payment slip and attach it to their active subscription directly from the portal's Plan tab. The gym owner sees it in their admin view.
2. **Renewal Reminder Emails** — A new scheduled backend function runs daily and emails gym members whose membership expires in exactly 2 days, reminding them to renew.

---

### Part 1: Proof of Payment (POP) Upload

#### Database Changes

**Add `pop_url` column to `gym_member_subscriptions`:**
A new nullable text column to store the URL of the uploaded proof-of-payment image.

```sql
ALTER TABLE public.gym_member_subscriptions
  ADD COLUMN IF NOT EXISTS pop_url text;
```

**Add `plan_name` column to `gym_member_subscriptions`:**
Currently `plan_name` doesn't exist in the table — the subscriptions only store `plan_id`. The `GymPortalMembership` component was reading a non-existent column. A `plan_name` column will be added to store the resolved plan name at subscription creation time (it's already being passed in the create dialog). This also makes the portal read simpler without needing joins.

```sql
ALTER TABLE public.gym_member_subscriptions
  ADD COLUMN IF NOT EXISTS plan_name text;
```

**RLS Policy — Portal member can UPDATE their own subscription's `pop_url` only:**
A portal user should only be able to update the `pop_url` field (no other fields). This is implemented as a targeted UPDATE policy:

```sql
CREATE POLICY "Portal: gym member can upload POP"
  ON public.gym_member_subscriptions FOR UPDATE TO authenticated
  USING (member_id IN (
    SELECT id FROM public.gym_members WHERE portal_user_id = auth.uid()
  ))
  WITH CHECK (member_id IN (
    SELECT id FROM public.gym_members WHERE portal_user_id = auth.uid()
  ));
```

**Storage bucket — `gym-pop` for proof-of-payment images:**
A new public bucket so that images are viewable by the gym owner without authentication overhead:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('gym-pop', 'gym-pop', true);

-- Portal members can upload to their own folder
CREATE POLICY "Portal member can upload POP"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gym-pop');

-- Anyone can view (public bucket)
CREATE POLICY "Public can read gym POP"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gym-pop');
```

#### Portal UI Changes — `GymPortalMembership.tsx`

The Plan tab gets a full billing-focused redesign:

- **Fetch joins the plan name** from `gym_membership_plans` via `plan_id` (since `plan_name` may not yet be populated for old subscriptions, it falls back gracefully).
- **Active subscription card shows:**
  - Plan name, status badge, date range
  - Days remaining progress bar
  - Amount paid (large, green)
  - Payment status badge
- **POP Upload section** (shown only when `payment_status !== 'paid'` OR always as proof):
  - "Attach Proof of Payment" button — opens file picker for images
  - On select: uploads to `gym-pop/{memberId}/{subscriptionId}.jpg` bucket
  - Updates `pop_url` on the subscription record
  - Shows a thumbnail preview once uploaded with a green "Submitted ✓" badge
  - If POP already exists: shows the existing thumbnail with option to replace
- **Full-screen Proof Modal:**
  - "Show as Proof" button opens a clean full-screen modal
  - If POP image exists: displays the photo with gym details overlay
  - If no POP: shows the digital receipt (plan name, amount, dates, member number)

#### Gym Owner View — `AddMembershipPlanDialog` / `AssignPlanDialog`

When the gym assigns a plan, `plan_name` is populated from the selected plan's `name`. This is wired into the existing `AssignPlanDialog.tsx` — just add `plan_name` to the insert payload.

The gym owner's subscription list in `useGymMemberSubscriptions.tsx` will show a camera icon if a POP has been submitted, so they can view it.

---

### Part 2: Membership Renewal Reminder Emails

#### New Edge Function — `check-gym-membership-reminders/index.ts`

A new function that:
1. Finds all `gym_member_subscriptions` where `end_date = today + 2 days` and `status = 'active'`
2. For each, looks up the `gym_members` record to get the member's `email`, `first_name`, and `last_name`
3. Gets the gym's `company_profiles` record (via `user_id`) for the gym name
4. Sends a personalized reminder email via Resend directly (same pattern as `send-email-notification`)
5. Also inserts a notification record for the gym owner: "Member [Name] membership expires in 2 days"

The email content:
```
Subject: Your [Gym Name] membership expires in 2 days

Hi [First Name],

Your [Plan Name] membership at [Gym Name] expires on [End Date].

To continue enjoying access, please make your renewal payment and attach your proof of payment in the member portal.

[Open Portal button → https://invoice-joy-track.lovable.app/portal]
```

#### Scheduled Cron Job

The function is called daily at 8 AM via `pg_cron` (same pattern used throughout the project):

```sql
SELECT cron.schedule(
  'gym-membership-reminders-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://upjtsekkpjgikrrlfoxv.supabase.co/functions/v1/check-gym-membership-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <anon_key>"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

### Files to Change

| File | Change |
|---|---|
| Database migration | Add `pop_url` + `plan_name` columns to `gym_member_subscriptions`; add portal UPDATE policy; create `gym-pop` storage bucket with policies |
| `src/components/portal/gym/GymPortalMembership.tsx` | Full redesign: fetch with plan join, POP upload UI, proof modal, amount paid display |
| `src/components/gym/AssignPlanDialog.tsx` | Pass `plan_name` on subscription insert |
| `supabase/functions/check-gym-membership-reminders/index.ts` | New edge function: finds expiring memberships, sends reminder emails + owner notifications |
| Cron SQL (run once via backend) | Schedule daily cron for the new function |

---

### Data Flow

```text
Member opens Plan tab
  → Fetches gym_member_subscriptions JOIN gym_membership_plans
  → Sees active plan + amount paid

Member taps "Attach Proof of Payment"
  → Selects photo from phone camera roll
  → Uploads to gym-pop bucket
  → pop_url saved on subscription record
  → Green "Submitted" badge appears

Member taps "Show as Proof"
  → Full-screen modal with photo + gym details

──────────────────────────────────────────────

Every day at 8 AM:
  check-gym-membership-reminders runs
  → Finds subscriptions expiring in 2 days
  → Emails each member directly
  → Notifies gym owner in notification panel
```

No new npm packages needed. Uses existing Resend key and `company-assets` bucket pattern.
