

# Admin: Deletable Tenant/Trial List

## Overview
Add the ability for super admins to delete tenants (company profiles and their subscriptions) directly from the Tenants tab in the admin panel. This includes a delete button per row with a confirmation dialog.

## What Changes

### 1. Database Migration
Add a DELETE RLS policy on the `subscriptions` table so super admins can delete subscription records:

```sql
CREATE POLICY "Admins can delete subscriptions"
  ON public.subscriptions FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));
```

Also add a DELETE policy on `company_profiles` for admins (currently missing):

```sql
CREATE POLICY "Admins can delete company profiles"
  ON public.company_profiles FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));
```

### 2. Update TenantsTab (`src/components/admin/TenantsTab.tsx`)
- Add a **Trash/Delete** icon button next to the existing View and Edit buttons in each row
- On click, show a confirmation dialog (using the existing `ConfirmDialog` pattern) warning "This will permanently delete this tenant's profile and subscription"
- On confirm, delete the subscription row (if exists) and the company profile row, then invalidate queries
- Add a `useMutation` for the delete operation

### 3. Update `useAdminTenants` Hook
- Add a `refetch` return value (already available from `useQuery`, just needs to be exposed or use `queryClient.invalidateQueries`)

## Files Summary

| File | Action |
|------|--------|
| `supabase/migrations/...` | Create -- Add DELETE RLS policies for admins |
| `src/components/admin/TenantsTab.tsx` | Modify -- Add delete button + confirmation + mutation |

No other files need changes. The existing `ConfirmDialog` component or `AlertDialog` from the UI library will be used for the confirmation step.

## Technical Details
- Delete order: subscription first (if exists), then company_profile -- to avoid orphaned records
- Confirmation uses the existing destructive action pattern with a red "Delete" button
- After deletion, invalidate `admin-tenants` and `admin-stats` query keys
- The delete button will be visually distinct (red/destructive variant) to signal danger
