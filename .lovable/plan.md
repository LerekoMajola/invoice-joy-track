# Fix new-tenant BizPro bugs

## What's actually broken (root cause)

The Leekay account works because it was created before the current signup flow and has all fields fully populated:
- `package_tier_id = c50944ab` (BizPro tier)
- `system_type = business`
- `company_profile` exists
- `user_modules` populated

New signups end up with **none of those properly set** because of a race in the code:

1. `Auth.tsx → handleAuth()` calls `supabase.auth.signUp(...)` then immediately calls `saveSignupData(userId)`.
2. `saveSignupData` does `UPDATE subscriptions SET system_type=..., package_tier_id=... WHERE user_id = userId`.
3. **But the `subscriptions` row does not exist yet.** It is only created later by `ProtectedRoute.tsx → checkSubscription()` when the user first lands on a protected route. The UPDATE silently affects 0 rows.
4. `ProtectedRoute` then INSERTs a fresh subscription with `plan = 'free_trial'`, `system_type` from metadata, but **no `package_tier_id`**.
5. `saveSignupData` also inserts into `user_modules`, then `ProtectedRoute` runs its own auto-assign (it checks `if (!userModules || userModules.length === 0)` so this part is safe, but order is fragile).

Confirmed in the database:

```
leekay (works):    package_tier_id = c50944ab, 10 active modules, company exists
optimum (broken):  package_tier_id = NULL,     9 active modules,  company exists
recent signups:    no subscription, no company at all
```

Downstream effects users would experience as "bugs":
- Billing page shows wrong/missing tier info, can't compute price → flat-rate fallback in `useAdminStats` works, but `Billing.tsx` UI keys off `packageTierId` and breaks.
- Features gated by tier (`useSubscription().packageTierId`) silently disable.
- `multi_company_enabled` and other tier-driven flags default to false.
- New tenants who never visit a protected route also have no subscription row at all (visible in the query results — many `nil` plan/status rows).

## Fix

### 1. Create the subscription row at signup time, not on first protected-route visit

Move the trial-subscription creation out of `ProtectedRoute.tsx` and into `Auth.tsx → saveSignupData()`. Insert a complete row in one go:

```ts
// in saveSignupData, before the user_modules insert
const trialEndsAt = new Date();
trialEndsAt.setDate(trialEndsAt.getDate() + 7);

await supabase.from('subscriptions').upsert({
  user_id: userId,
  plan: 'free_trial',
  status: 'trialing',
  system_type: selectedSystem,
  package_tier_id: selectedTierId,           // <-- now actually set
  trial_ends_at: trialEndsAt.toISOString(),
  current_period_start: new Date().toISOString(),
  current_period_end: trialEndsAt.toISOString(),
}, { onConflict: 'user_id' });

await supabase.from('usage_tracking').upsert({
  user_id: userId,
  period_start: today,
  period_end: oneMonthLater,
  clients_count: 0, quotes_count: 0, invoices_count: 0,
}, { onConflict: 'user_id,period_start' });
```

### 2. Simplify `ProtectedRoute.tsx`

Keep its insert as a fallback (for legacy users without a row), but make it idempotent with `upsert` and stop overwriting `package_tier_id` to null. The auto-module-assignment block stays as-is (it already guards on existing rows).

### 3. Backfill existing broken accounts

One-shot SQL migration to fix users who already signed up under the broken flow:

```sql
-- Set package_tier_id from system_type for any subscription missing it
UPDATE subscriptions s
SET package_tier_id = pt.id
FROM package_tiers pt
WHERE s.package_tier_id IS NULL
  AND pt.is_active = true
  AND pt.system_type = s.system_type;

-- Create trial subscriptions for auth users who have none
INSERT INTO subscriptions (user_id, plan, status, system_type, trial_ends_at,
                           current_period_start, current_period_end, package_tier_id)
SELECT u.id,
       'free_trial', 'trialing',
       COALESCE(u.raw_user_meta_data->>'system_type', 'business'),
       u.created_at + interval '7 days',
       u.created_at,
       u.created_at + interval '7 days',
       (SELECT id FROM package_tiers
        WHERE system_type = COALESCE(u.raw_user_meta_data->>'system_type','business')
          AND is_active = true LIMIT 1)
FROM auth.users u
LEFT JOIN subscriptions s ON s.user_id = u.id
WHERE s.id IS NULL;
```

### 4. Verify

After deploy, sign up a fresh test account on BizPro and confirm:
- `subscriptions` row appears immediately with `package_tier_id` set.
- Billing page shows BizPro M350 correctly.
- Dashboard onboarding dialog opens to create the company profile.
- No console errors on Clients / Quotes / Invoices pages.

## Files to edit

- `src/pages/Auth.tsx` — write full subscription row in `saveSignupData`
- `src/components/layout/ProtectedRoute.tsx` — make the fallback idempotent (upsert) and stop relying on it as the primary creator
- One database migration for the backfill above

## Out of scope

- The "no `company_profile`" issue is handled by `CompanyOnboardingDialog` on Dashboard load — that already works. Not changing it.
- Pricing/tier definitions stay as-is.
