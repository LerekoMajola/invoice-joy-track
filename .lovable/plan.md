

## Fix: Admin Showing M730 Instead of M700 for GymPro

### Root Cause

The admin dashboard calculates tenant pricing by **summing individual module prices** from `user_modules` + `platform_modules`. For MISFIT, this adds up to M730 (the sum of all their activated module prices). However, MISFIT subscribed to the **GymPro Professional bundle** which has a fixed `bundle_price` of **M700** in the `package_tiers` table.

The code currently ignores the `package_tiers.bundle_price` entirely when displaying the tenant's monthly price.

### Fix

**File: `src/hooks/useAdminTenants.tsx`**

1. Join `package_tiers` data when fetching subscriptions -- read `package_tier_id` from each subscription and fetch the corresponding `bundle_price`
2. Update the `module_total` calculation logic on line 128 to use this priority:
   - First: `billing_override` (admin manual override)
   - Second: `bundle_price` from the linked `package_tier_id` (the tier they signed up with)
   - Third: Sum of individual module prices (fallback for custom/legacy users)
   - Last: 0

### Technical Detail

Current logic:
```
module_total: billing_override ?? moduleTotals[userId] ?? 0
```

New logic:
```
module_total: billing_override ?? tierPrices[userId] ?? moduleTotals[userId] ?? 0
```

Where `tierPrices` is built by looking up each subscription's `package_tier_id` against the fetched `package_tiers` bundle prices.

This will also fetch the tier name so it could optionally be displayed alongside the price. The change is confined to a single file and ensures every tenant on a bundle tier shows the correct bundle price.
