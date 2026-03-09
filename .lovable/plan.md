

## Fix: Business Owner Can't See Staff-Created Data + Sidebar Mismatch

### Root Cause Analysis

**Two related problems:**

**Problem 1: Staff-created data invisible to owner**
Before the recent migration (which added `can_access_company_data` and staff RLS policies), the staff member could NOT load the owner's company profile (RLS blocked it). This means:
- `ActiveCompanyContext` staff fallback failed silently — `activeCompany` was `null`
- The insert code `user_id: activeCompany?.user_id || user.id` fell back to the **staff member's own user ID**
- `company_profile_id` was set to `null`
- Result: existing staff-created records have `user_id = staff_id` and `company_profile_id = null`
- The owner's RLS check (`auth.uid() = user_id`) fails, and the new `can_access_company_data(null)` also returns false

**Problem 2: Staff sidebar shows more modules than owner**
When a staff member logs in, `ProtectedRoute` auto-assigns modules. If the staff account has no `selected_module_keys` in their user metadata, it assigns **ALL active platform modules** (legacy fallback at line 128-143). Meanwhile the owner may have selected specific modules during signup. So the staff sees more sidebar tabs.

### Solution

**1. Fix existing orphaned staff data (data migration via edge function)**

Create a one-time edge function `fix-staff-orphaned-data` that:
- Finds all `staff_members` records with `user_id` set
- For each staff member, finds the owner's company profile
- Updates records in `quotes`, `invoices`, `clients`, `delivery_notes`, `tasks`, `leads`, `contacts` where `user_id = staff_user_id` — sets `user_id` to the owner's user_id and `company_profile_id` to the owner's company profile ID
- Admin-only access

**2. Fix `useModules` to use owner's modules for staff**

When the logged-in user is a staff member (detected via `staff_members` lookup), `useModules` should query `user_modules` using the **owner's user_id** instead of the staff's own. Additionally, filter by `staff_module_access` if the owner has restricted which modules the staff can see.

**3. Prevent `ProtectedRoute` from auto-assigning modules to staff**

Add a check: if the user is a staff member, skip the auto-module-assignment logic. Staff should inherit modules from their owner, not get their own set.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/fix-staff-orphaned-data/index.ts` | New one-time edge function to reassign orphaned staff records to owner |
| `src/hooks/useModules.tsx` | For staff users, load owner's modules instead of own; filter by `staff_module_access` |
| `src/components/layout/ProtectedRoute.tsx` | Skip auto-module-assignment for staff members |

### Technical Details

**Edge function logic:**
```
For each staff_member with user_id:
  owner_user_id = staff.owner_user_id
  company_profile = first company_profile where user_id = owner_user_id
  For each table in [quotes, invoices, clients, ...]:
    UPDATE table SET user_id = owner_user_id, company_profile_id = company_profile.id
    WHERE user_id = staff.user_id AND (company_profile_id IS NULL OR company_profile_id != company_profile.id)
```

**useModules staff-awareness:**
```typescript
// If user has no owned companies, check if they're staff
const staffRecord = await supabase.from('staff_members')
  .select('owner_user_id, id')
  .eq('user_id', user.id).eq('status', 'active').maybeSingle();

if (staffRecord) {
  // Load owner's modules, then filter by staff_module_access
  query user_modules where user_id = staffRecord.owner_user_id
  query staff_module_access where staff_member_id = staffRecord.id
  return intersection
}
```

