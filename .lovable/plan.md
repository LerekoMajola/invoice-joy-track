

## Fix: Staff-Created Quotes Not Visible to Owner

### Root Cause

I checked the database and found the staff-created quote (QT-0001):
- `user_id` = `ca1da623` (the **staff member's** own ID)
- `company_profile_id` = **null**

The owner's quotes all have `user_id = 0ad03a1e` and `company_profile_id = bac6326e`. Since both the old RLS policy (`auth.uid() = user_id`) and the new staff-aware policy (`can_access_company_data(company_profile_id)`) fail for this record, the owner can't see it.

**Why it happened**: The staff member's owner (`3a9ffae1`) has **no company profile**. So when `ActiveCompanyContext` loaded for the staff user, `activeCompany` was null. The quote creation code fell back to:
```
user_id: activeCompany?.user_id || user.id  →  staff's own ID
company_profile_id: activeCompanyId || null  →  null
```

Additionally, the staff member created their own company profiles (7 of them), suggesting onboarding wasn't blocked for their account.

### Plan

**1. Fix `useQuotes.tsx` — Staff-safe record creation**

Add a fallback that queries the `staff_members` table when `activeCompany` is null but the user is staff. This ensures `user_id` is always set to the owner and `company_profile_id` is resolved correctly.

- Before creating a quote, if `activeCompany` is null, check `staff_members` for `owner_user_id`
- If found, query `company_profiles` for the owner's first profile
- Use these resolved values instead of falling back to `user.id`
- Block creation with an error toast if neither can be resolved

**2. Fix the orphaned quote data via migration**

Update the existing orphaned quote to point to the correct owner and company:
```sql
UPDATE quotes
SET user_id = (SELECT owner_user_id FROM staff_members WHERE user_id = 'ca1da623-5452-4f99-ab37-5fc0187ebbf1'),
    company_profile_id = (SELECT id FROM company_profiles WHERE user_id = (SELECT owner_user_id FROM staff_members WHERE user_id = 'ca1da623-5452-4f99-ab37-5fc0187ebbf1') LIMIT 1)
WHERE id = '7b03d595-e2b0-4902-916a-ee1f9911d58d';
```

Note: The owner `3a9ffae1` has no company profile, so this specific record may need manual cleanup or deletion. I'll handle that gracefully.

**3. Apply the same guard to other creation hooks**

The same `activeCompany?.user_id || user.id` pattern exists in `useInvoices`, `useDeliveryNotes`, `useTasks`, `useLeads`, etc. Apply the same staff-safe resolution to prevent this across all modules.

### Files to Change

| File | Change |
|------|--------|
| `src/hooks/useQuotes.tsx` | Add staff-safe owner/company resolution before insert |
| `src/hooks/useInvoices.tsx` | Same pattern fix |
| `src/hooks/useDeliveryNotes.tsx` | Same pattern fix |
| `src/hooks/useTasks.tsx` | Same pattern fix |
| `src/hooks/useLeads.tsx` | Same pattern fix |
| `src/hooks/useClients.tsx` | Same pattern fix |
| `src/hooks/useContacts.tsx` | Same pattern fix |
| DB migration | Fix orphaned quote record |

