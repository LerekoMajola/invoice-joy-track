

## Fix: Revenue Not Showing + Conversion Rate Logic

### Problem 1: Revenue shows as zero
The MRR and Platform Revenue calculations use a hardcoded `PLAN_PRICES` lookup table that only knows about `free_trial`, `basic`, `standard`, and `pro`. E-Legal's subscription plan is `custom` (module-based), so it maps to M0. Since the platform now uses module-based pricing, the revenue calculation needs to pull actual prices from each tenant's active modules.

E-Legal's actual monthly cost is M420 (sum of 6 active modules: Core CRM M100, Cases M80, Staff M80, Documents M70, Court Calendar M60, Tasks M30).

### Problem 2: Conversion rate is misleading
Currently it divides active subscriptions by (active + cancelled + expired), which doesn't represent trial-to-paid conversion. The correct metric: of all tenants whose trial has ended, how many converted to active paid status.

### The Fix

**File: `src/hooks/useAdminStats.tsx`**

1. **MRR calculation** -- Instead of looking up `PLAN_PRICES[sub.plan]`, query the `user_modules` table joined with `platform_modules` to get actual monthly prices per tenant. Sum each active tenant's module prices to get their real monthly cost.

2. **Total Revenue** -- Same approach: use actual module totals instead of hardcoded plan prices. Multiply each tenant's module total by the number of months they've been active.

3. **Revenue by month chart** -- Update `getMonthlySubscriptionRevenue` to use the same module-based pricing per tenant.

4. **Conversion rate** -- Change to: count subscriptions where `trial_ends_at` is in the past (trial ended) and status is `active` (converted), divided by all subscriptions where `trial_ends_at` is in the past (trial ended regardless of outcome). This gives the true trial-to-paid conversion percentage.

5. **Remove `PLAN_PRICES`** -- No longer needed since all pricing comes from the database.

### Technical Detail

The hook will make two additional queries:
- `user_modules` (filtered to `is_active = true`)
- `platform_modules` (to get `monthly_price` per module)

Then build a map of `user_id -> monthly_total` by summing module prices. This map replaces `PLAN_PRICES` everywhere in the calculations.

