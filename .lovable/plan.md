
## Fix: Admin Stats Counting Sub-Companies as Separate Tenants

### The Problem
The admin stats hook (`useAdminStats.tsx`) counts every row in `company_profiles` as a separate tenant. Since tenants like "Leekay" can create additional companies (e.g., "Optimum Resources") under the same subscription, the "Total Tenants", "Recent Signups", and signup chart numbers are inflated. The MRR is correct since it's subscription-based, but the tenant counts are misleading.

### The Fix

**File: `src/hooks/useAdminStats.tsx`**

1. Add `user_id` to the profiles query (currently only fetches `id, created_at`)
2. Filter out soft-deleted profiles: `.is('deleted_at', null)`
3. Filter out soft-deleted subscriptions: `.is('deleted_at', null)`
4. Deduplicate profiles by `user_id` before counting -- only count unique users, not individual company profiles
5. Use the deduplicated list for `totalTenants`, `recentSignups`, and `signupsByMonth`

This ensures sub-companies are not counted as separate tenants in the overview dashboard. Revenue and MRR numbers remain unchanged since they already work off subscriptions (one per user).

### Technical Detail

```
// Before (counts all profiles including sub-companies)
const totalTenants = profiles.length;

// After (counts unique users only)
const uniqueUserProfiles = new Map();
profiles.forEach(p => {
  if (!uniqueUserProfiles.has(p.user_id)) {
    uniqueUserProfiles.set(p.user_id, p);
  }
});
const totalTenants = uniqueUserProfiles.size;
```

The same deduplication applies to `recentSignups` and the `signupsByMonth` chart data, using the earliest `created_at` per `user_id` as the signup date.
