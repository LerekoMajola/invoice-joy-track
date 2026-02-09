

# Fix: Add "Legal" to Subscriptions System Type Constraint

## Problem
The `subscriptions` table has a CHECK constraint that only allows `business`, `workshop`, and `school`. When you signed up as "legal", the subscription record failed to insert, so the app defaults to the "business" layout and hides all legal navigation items.

## Fix

### Database Migration
Update the CHECK constraint to include `legal`:

```sql
ALTER TABLE public.subscriptions
  DROP CONSTRAINT subscriptions_system_type_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_system_type_check
  CHECK (system_type = ANY (ARRAY['business', 'workshop', 'school', 'legal']));
```

### What Happens After
No code changes are needed. The existing logic in `ProtectedRoute` already:
1. Detects when a user has no subscription
2. Reads the `system_type` from the user's signup metadata
3. Creates the subscription record

Once the constraint allows `legal`, this will succeed on your next page load, and the sidebar will show the legal navigation items (Cases, Time Tracking, Legal Docs, Court Calendar) along with the Legal Dashboard.

## Files Summary

| File | Action |
|------|--------|
| New migration SQL | Create -- update CHECK constraint to include 'legal' |

One migration, zero code changes.
