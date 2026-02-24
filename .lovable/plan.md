

## Fix: Gym Members and Plans Not Showing

### Root Cause

The member "Tlotliso Molefi" and the plan "Monthly" were both created with `company_profile_id = NULL` in the database. This happened because the active company context wasn't resolved at the time of creation.

However, the fetch queries filter by `company_profile_id = 'fb82722f-...'` (the MISFIT company), so records with NULL don't match and are invisible.

### Fix Steps

#### 1. Fix the existing data in the database (2 UPDATE statements)

Update the orphaned records to link them to the correct company:

- **gym_members**: Set `company_profile_id` to `fb82722f-5c32-4463-8acd-da9a84c0dc8f` for member `daf9a77e-4bcf-4f3a-900e-ce611d3e617f` (Tlotliso Molefi)
- **gym_membership_plans**: Set `company_profile_id` to `fb82722f-5c32-4463-8acd-da9a84c0dc8f` for plan `d618e8f9-845c-4fde-949a-88ef2f18bd3a` (Monthly)

#### 2. Prevent this from happening again

**Files: `src/hooks/useGymMembers.tsx` and `src/hooks/useGymMembershipPlans.tsx`**

In both hooks' create functions, add a fallback: if `activeCompanyId` is null at creation time, look up the user's company profile from the database before inserting. This ensures records are always linked to the correct company.

Add a helper that queries `company_profiles` by `user_id` to get the company ID as a fallback when `activeCompanyId` from context is not yet available.

### Technical Details

In both `createMember` and `createPlan`, change:
```
company_profile_id: activeCompanyId || null
```
to:
```
company_profile_id: activeCompanyId || (await resolveCompanyId(activeUser.id))
```

Where `resolveCompanyId` is a small async function that queries:
```sql
SELECT id FROM company_profiles WHERE user_id = ? LIMIT 1
```

This ensures the company link is always set correctly.
