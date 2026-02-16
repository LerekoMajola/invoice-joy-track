
# Plan: Module-Based Package Pricing Throughout the Platform

## Problem
The subscription system currently uses hardcoded plan prices (Basic=M300, Standard=M500, Pro=M800) that don't reflect the actual modules each tenant selected. The pricing should be driven by the sum of their active modules, which is what they chose during signup.

## Changes

### 1. Admin SubscriptionsTab -- Show Real Module-Based Pricing
**File: `src/components/admin/SubscriptionsTab.tsx`**
- Remove the hardcoded `PLAN_PRICES` object
- For each tenant, fetch their active modules' total from `user_modules` joined with `platform_modules`
- Display the real module-based monthly total in the Price column and detail sheet
- Pass the real total to `PaymentTracker` as `planPrice`

### 2. Admin SubscriptionsTab -- Fetch Module Totals
**File: `src/hooks/useAdminTenants.tsx`**
- Extend the tenant query to also fetch each user's module total by querying `user_modules` + `platform_modules`
- Add a `module_total` field to the `Tenant` type so it's available everywhere

### 3. Billing Page -- Show Package Breakdown and Amount
**File: `src/pages/Billing.tsx`**
- Import `useModules` hook to get `userModules` and `getMonthlyTotal()`
- Add a "Your Package" card showing active modules with their individual prices
- Show the monthly total prominently so users know exactly what to pay when upgrading

### 4. EditSubscriptionDialog -- Activate with Proper Dates
**File: `src/components/admin/EditSubscriptionDialog.tsx`**
- When admin changes status to `active`, automatically set `current_period_start` to today and `current_period_end` to 30 days from today
- This marks the official start of the paid subscription (anniversary-aligned with the earlier payment tracker work)

### 5. PaymentRequired Page -- Already Correct
The paywall page already uses `getMonthlyTotal()` from `useModules`, so it shows the correct module-based total. No changes needed here.

---

## Technical Details

### `src/hooks/useAdminTenants.tsx`
- After fetching subscriptions, also fetch all `user_modules` with joined `platform_modules` prices
- Group by `user_id` and sum `monthly_price` for active modules
- Add `module_total: number` to the Tenant interface

### `src/components/admin/SubscriptionsTab.tsx`
- Remove `PLAN_PRICES` constant
- Use `tenant.module_total` instead of `PLAN_PRICES[plan]` for display and PaymentTracker
- The Price column will show the real per-tenant module-based total

### `src/pages/Billing.tsx`
- Add `useModules` hook import
- Add a "Your Package" card listing each active module name + price
- Show monthly total at the bottom of the card
- Include this amount in the M-Pesa payment instructions step (amount line)

### `src/components/admin/EditSubscriptionDialog.tsx`
- Add logic: when `newStatus === 'active'` and current status is `trialing`, set `current_period_start = new Date().toISOString()` and `current_period_end` to 30 days later
- This ensures the subscription officially starts when the admin activates it after payment confirmation
