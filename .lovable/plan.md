

## Fix: Exclude Portal Accounts from Admin Customers List

### Problem
Users like "Mpho Brown" and "June Marame" are **gym member portal accounts** -- they are clients belonging to your tenants, not platform customers. They appear in the Customers tab because the backend function lists all auth users (minus staff and super admins) but doesn't filter out portal accounts.

### Root Cause
When portal accounts are created (for gym members, school parents, etc.), they get a `portal_type` field in their user metadata (e.g., `portal_type: "gym"`). The `admin-get-signups` function doesn't check for this field, so these accounts are incorrectly returned as platform signups.

### Solution
Add a filter in the `admin-get-signups` edge function to skip any user whose `user_metadata` contains a `portal_type` field. This cleanly separates tenant clients from actual platform customers.

### Technical Details

**File: `supabase/functions/admin-get-signups/index.ts`**

In the `.filter()` chain on line 148, add an additional condition to exclude users with `portal_type` in their metadata:

```
.filter((user) => {
  if (excludedUserIds.has(user.id)) return false;
  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  if (meta.portal_type) return false; // Exclude portal accounts (gym members, school parents, etc.)
  return true;
})
```

This is a one-line addition inside the existing filter. No other files need to change.

### Changes Summary

| File | Change |
|------|--------|
| `supabase/functions/admin-get-signups/index.ts` | Add `portal_type` check to exclude tenant client portal accounts from the signups list |

