

## Fix: Staff Members Cannot Share Data with Owner Account

### Root Cause

This is a **systemic multi-tenant isolation issue**. Every business table (`quotes`, `clients`, `invoices`, etc.) has RLS policies using `auth.uid() = user_id`. When a staff member logs in and creates a quote, the quote's `user_id` is set to the **staff member's auth ID**, not the owner's. The owner's RLS check (`auth.uid() = user_id`) then fails because the IDs don't match.

Additionally, `company_profiles` RLS also blocks staff from seeing the owner's company profile, so the staff member can't even load the company context properly.

**Affected tables**: quotes, clients, invoices, delivery_notes, tasks, leads, and 50+ other tables with `auth.uid() = user_id` RLS.

### Solution: Company-Profile-Based Access

Instead of tying data access to `user_id` alone, we add a parallel RLS check: "can this user access data belonging to this company profile?" A user can access a company profile's data if they are the **owner** OR an **active staff member** of that company.

### Changes

**1. New database function: `can_access_company_data()`**

A `SECURITY DEFINER` function that returns true if `auth.uid()` is either:
- The `user_id` (owner) of the given `company_profile_id`, OR
- An active `staff_member` with `owner_user_id` matching the company's owner

```sql
CREATE OR REPLACE FUNCTION public.can_access_company_data(_company_profile_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_profiles
    WHERE id = _company_profile_id AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM staff_members sm
    JOIN company_profiles cp ON cp.user_id = sm.owner_user_id
    WHERE sm.user_id = auth.uid()
      AND sm.status = 'active'
      AND cp.id = _company_profile_id
  )
$$;
```

**2. Add RLS policies on company_profiles for staff**

Allow staff to SELECT the company profile they belong to.

**3. Add staff-aware RLS policies on core business tables**

For `quotes`, `clients`, `invoices`, `quote_line_items`, `invoice_line_items`, `delivery_notes`, `tasks`, `leads`, and other key tables, add a new SELECT/INSERT/UPDATE/DELETE policy:

```sql
CREATE POLICY "Staff can access company data"
ON public.quotes FOR ALL TO authenticated
USING (can_access_company_data(company_profile_id))
WITH CHECK (can_access_company_data(company_profile_id));
```

**4. Update `ActiveCompanyContext.tsx`**

Staff members don't own company profiles, so `eq('user_id', user.id)` returns nothing. Add a fallback: if no owned companies found, look up the user's `staff_members` record to find their `owner_user_id`, then fetch that owner's company profiles.

**5. Update `useQuotes.tsx` (and similar hooks)**

When a staff member creates a quote, set `user_id` to the **company profile's owner** (not the staff member's auth ID). This keeps data ownership consistent. The `activeCompany` object already has the owner's `user_id`.

### Migration: Tables to update with staff-aware RLS

Priority tables (most impacted by staff workflow):
- `quotes`, `quote_line_items`
- `clients`, `client_documents`
- `invoices`, `invoice_line_items`
- `delivery_notes`
- `tasks`
- `leads`
- `company_profiles` (SELECT only for staff)
- `contacts`

### Files changed

| File | Change |
|------|--------|
| Migration SQL | Create `can_access_company_data()` function + add staff-aware RLS policies on ~10 core tables |
| `src/contexts/ActiveCompanyContext.tsx` | Add staff fallback to load owner's company profile |
| `src/hooks/useQuotes.tsx` | Use company owner's `user_id` instead of `user.id` for inserts |
| `src/hooks/useInvoices.tsx` | Same owner ID fix for inserts |
| `src/hooks/useClients.tsx` | Same owner ID fix for inserts |
| `src/hooks/useDeliveryNotes.tsx` | Same owner ID fix for inserts |
| `src/hooks/useTasks.tsx` | Same owner ID fix for inserts |
| `src/hooks/useLeads.tsx` | Same owner ID fix for inserts |
| `src/hooks/useContacts.tsx` | Same owner ID fix for inserts |

No data loss. Existing records remain untouched. The new RLS policies are additive (OR conditions alongside existing ones).

