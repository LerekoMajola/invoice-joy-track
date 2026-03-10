

## Fix: Companies Won't Delete

### Root Cause

The `company_profiles` table has RLS policies for admin SELECT and DELETE, but **no admin UPDATE policy**. When you click delete on a customer, the code tries to soft-delete by updating the `deleted_at` column:

```typescript
await supabase.from('company_profiles').update({ deleted_at: now }).eq('user_id', userId);
```

This silently fails because RLS blocks the update — only the profile owner can update their own profile. The company then reappears because nothing actually changed.

### Fix

**1. Database migration** — Add admin UPDATE policy on `company_profiles`:
```sql
CREATE POLICY "Admins can update company profiles"
ON public.company_profiles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
```

**2. CustomersTab.tsx** — Change the delete mutation for onboarded tenants to call the edge function with `action: 'permanent_delete'` instead of doing a client-side soft-delete. This uses the service role key (bypasses RLS) and fully removes all data.

Update the delete confirmation message to warn that this permanently removes the company and all its data.

