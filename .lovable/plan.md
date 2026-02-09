

# New "Sign-ups" Tab in Admin Panel

## Overview
Add a new tab to the Admin panel that shows **all users who signed up**, including those who never completed onboarding (no company profile). This gives full visibility into the signup funnel.

## Why an Edge Function is Needed
User signup data (email, created date, system type) lives in the `auth.users` table, which cannot be queried from the browser client SDK. An edge function with the service role key is required to fetch this data.

## What Changes

### 1. New Edge Function: `supabase/functions/admin-get-signups/index.ts`
- Verifies the calling user has the `super_admin` role (security check)
- Queries `auth.users` for all users with their metadata (email, created_at, system_type)
- Cross-references `company_profiles` to determine onboarding status
- Cross-references `subscriptions` to show subscription status
- Returns a combined list sorted by signup date (newest first)

### 2. New Hook: `src/hooks/useAdminSignups.tsx`
- Calls the edge function via `supabase.functions.invoke('admin-get-signups')`
- Returns typed array of signups with loading state
- Only enabled when user is admin

### 3. New Component: `src/components/admin/SignupsTab.tsx`
- Table listing all signups with columns:
  - **Email** -- from auth.users
  - **System Type** -- badge (Business/Workshop/School/Legal)
  - **Onboarded** -- green check or red X (whether company_profiles record exists)
  - **Subscription** -- status badge or "None"
  - **Signed Up** -- formatted date
  - **Actions** -- Delete button with confirmation
- Search filter by email
- Filter by onboarding status (All / Onboarded / Not Onboarded)
- Filter by system type
- Delete action removes the auth user via the edge function (admin only)

### 4. Update Admin Page: `src/pages/Admin.tsx`
- Add new "Sign-ups" tab between "Tenants" and "Subscriptions"

### 5. Update Admin Barrel Export: `src/components/admin/index.ts`
- Export `SignupsTab`

## Layout of Sign-ups Tab

```text
[Search by email...] [Onboarding: All v] [System: All v]

| Email              | System   | Onboarded | Subscription | Signed Up    | Actions |
|--------------------|----------|-----------|--------------|--------------|---------|
| user@example.com   | Business | Yes       | Trialing     | Feb 9, 2026  | Delete  |
| test@test.com      | Legal    | No        | None         | Feb 8, 2026  | Delete  |
```

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/admin-get-signups/index.ts` | Create -- edge function to fetch auth.users |
| `src/hooks/useAdminSignups.tsx` | Create -- hook to call edge function |
| `src/components/admin/SignupsTab.tsx` | Create -- table UI component |
| `src/pages/Admin.tsx` | Modify -- add Sign-ups tab |
| `src/components/admin/index.ts` | Modify -- export SignupsTab |

## Technical Details

- The edge function uses `supabase.auth.admin.listUsers()` with the service role key to access all auth users
- Admin verification: the function checks the JWT from the request, then verifies the user has `super_admin` role via the `user_roles` table
- Delete functionality calls `supabase.auth.admin.deleteUser(userId)` which cascades to remove related data
- The hook uses `useQuery` with `queryKey: ['admin-signups']` and is gated by `isAdmin`
- Onboarding status is determined by checking if a `company_profiles` record exists for that user_id
