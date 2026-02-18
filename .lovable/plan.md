
## Fix: Additional Company Profiles Appearing as Separate Billing Entries

### The Problem
The multi-company feature allows a single tenant to create up to 5 company profiles under one subscription. The `useAdminTenants` hook fetches every row from `company_profiles` and maps each one as a separate "tenant" in the Billing tab. This means one real customer with 3 company profiles shows up as 3 separate billing rows -- all called "My Company" with duplicate subscription data.

### The Fix

**File: `src/hooks/useAdminTenants.tsx`**

After building the tenants array from all company profiles, deduplicate by `user_id` so each subscription holder appears only once. The logic:

1. Group all company profiles by `user_id`
2. For each `user_id`, pick the **primary** company profile (the one that has been properly named/onboarded, or the earliest created one as fallback)
3. Only include entries that have a matching subscription (no subscription = not a billing customer)

This ensures:
- Each real tenant appears exactly once in the Billing tab
- The displayed company name is their primary/onboarded profile name
- Additional company profiles they created for multi-company management are hidden from the admin billing view
- Tenants without subscriptions don't appear in billing at all
