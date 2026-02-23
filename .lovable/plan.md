

## Fix: "Database error deleting user" on Customer Deletion

### Root Cause

The `job_cards` table has a foreign key constraint on `client_id` that references `clients(id)` **without** `ON DELETE CASCADE` or `ON DELETE SET NULL`. When the edge function tries to hard-delete an auth user:

1. `auth.admin.deleteUser()` cascades to delete rows in `clients` (which has `ON DELETE CASCADE` on `user_id`)
2. But `job_cards` references those `clients` rows without a cascade rule, so the database blocks the entire deletion

The specific user being deleted has 2 clients, one of which is referenced by 2 job cards.

### Solution

Two changes to make this robust:

**1. Database Migration -- Add `ON DELETE SET NULL` to problematic FK constraints**

Several FK constraints on `job_cards` and other tables lack cascade/set-null behavior. Update them so deleting a parent row sets the FK column to NULL instead of blocking:

- `job_cards.client_id_fkey` -> `ON DELETE SET NULL`
- `job_cards.invoice_id_fkey` -> `ON DELETE SET NULL`
- `job_cards.source_quote_id_fkey` -> `ON DELETE SET NULL`
- `job_cards.assigned_technician_id_fkey` -> `ON DELETE SET NULL`
- `legal_case_expenses.invoice_id_fkey` -> `ON DELETE SET NULL`

**2. Edge Function -- Better error handling and logging**

Update `admin-get-signups/index.ts` to log the actual error message from `deleteUser` so future issues are easier to diagnose, and add a fallback: if hard-delete fails, return a clear message indicating which constraint blocked it.

### Technical Details

| Change | File |
|--------|------|
| Migration: alter FK constraints to add `ON DELETE SET NULL` | New SQL migration |
| Better error logging in delete path | `supabase/functions/admin-get-signups/index.ts` |

The migration SQL will drop and recreate the affected constraints with `ON DELETE SET NULL`. This is safe because all affected columns are already nullable.
