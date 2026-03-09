

## Fix: Staff Data Isolation + Sidebar Module Mismatch (Root Cause Found)

### What's Actually Happening

I traced the exact data in the database. Here's what went wrong:

1. **Staff created their own company profile.** When the staff member logged in, the onboarding flow created a company profile owned by the staff user (`8f5bfce0`, user_id = `a30603a3`). So `ActiveCompanyContext` found that profile first (line 46: `eq('user_id', user.id)`) and never hit the staff fallback (which only triggers when `typedProfiles.length === 0`).

2. **All staff-created records point to the wrong owner.** Quotes and clients have `user_id = staff_id` and `company_profile_id = staff's own profile` (or null). The owner's RLS and `can_access_company_data()` checks never match.

3. **Staff modules are auto-assigned to the staff user.** The `ProtectedRoute` auto-assignment ran before the staff check was added, giving the staff ALL platform modules under their own user_id. Meanwhile `useModules` now tries to use the owner's modules via `effectiveUserId`, but `user_modules` RLS blocks it (`auth.uid() = user_id` fails because staff's uid != owner's uid).

### Fix Plan

**1. Database migration (SQL)**

- Add RLS policy on `user_modules` allowing staff to SELECT their owner's modules
- Reassign the 2 orphaned quotes and 2 orphaned clients from staff user_id to owner user_id, with correct company_profile_id
- Delete the staff user's own company profile (it shouldn't exist)
- Delete the staff user's own user_modules entries (they inherit from owner)

```sql
-- Staff can read owner's modules
CREATE POLICY "Staff can view owner modules"
ON public.user_modules FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_members sm
    WHERE sm.user_id = auth.uid()
      AND sm.owner_user_id = user_modules.user_id
      AND sm.status = 'active'
  )
);

-- Fix orphaned data
UPDATE quotes SET user_id = 'de2634af-...', company_profile_id = 'cc4f4565-...'
WHERE user_id = 'a30603a3-...';
-- (same for clients, and delete staff's company_profile + user_modules)
```

**2. Fix `ActiveCompanyContext.tsx`**

The staff fallback only triggers when `typedProfiles.length === 0`. But if the staff created their own company profile, it returns that instead. Fix: **check if user is staff FIRST**, and if so, always load the owner's profiles regardless.

**3. Prevent staff from getting auto-assigned company profiles**

In `CompanyOnboardingDialog` or wherever company profiles are created for new users, skip if the user is a staff member.

### Files Changed

| File | Change |
|------|--------|
| Migration SQL | Add staff RLS on `user_modules` + fix orphaned data + cleanup staff's own profile/modules |
| `src/contexts/ActiveCompanyContext.tsx` | Check staff status first, always load owner's company profiles for staff |
| `src/components/onboarding/CompanyOnboardingDialog.tsx` | Skip onboarding for staff members |

