

## Security Audit: What Is Currently Broken and What Needs Fixing

### Critical Finding: Two Columns Are Missing from the Database

The entire portal system was built assuming two columns exist that do **not** exist in the live database:

- `gym_members.portal_user_id` — the auth ID of the gym member's portal account
- `gym_members.owner_user_id` — the gym business owner's user ID (separate from the member's portal user ID)
- `students.portal_user_id` — the auth ID of the guardian's portal account
- `students.owner_user_id` — the school owner's user ID

**What is actually in the database right now:**

| Table | `user_id` means |
|---|---|
| `gym_members` | The **gym owner's** auth ID |
| `students` | The **school owner's** auth ID |

The `create-portal-account` edge function currently does:
```sql
UPDATE gym_members SET user_id = <portal_user_id> WHERE id = <member_id>
```
This would **overwrite the gym owner's user_id**, destroying their access to all their own members. This is a critical security and data integrity bug — the function correctly hasn't worked yet because it also references `owner_user_id` which doesn't exist on those tables, so it returns 404/error before reaching the update.

---

### What the Fix Requires

Three things must happen together:

**1. Database Schema (Migration)**

Add the missing columns to both tables:
- `gym_members.owner_user_id` — stores the gym owner's auth ID (populated from existing `user_id`)
- `gym_members.portal_user_id` — stores the portal member's auth ID (nullable, null until "Create Portal Access" is clicked)
- `students.owner_user_id` — stores the school owner's auth ID (populated from existing `user_id`)
- `students.portal_user_id` — stores the guardian's portal auth ID (nullable)

Then update existing rows to backfill `owner_user_id` from `user_id`.

**2. RLS Policies (Migration)**

Add read-only portal policies to all tables portal users need:

```
gym_members:            portal_user_id = auth.uid()  → can read own record
gym_member_subscriptions: via gym_members.portal_user_id join
gym_classes:            via gym_members.portal_user_id → owner_user_id join
gym_class_schedules:    via gym_members.portal_user_id → owner_user_id join
gym_membership_plans:   via gym_members.portal_user_id → owner_user_id join

students:               portal_user_id = auth.uid()  → can read own child's record
student_fee_payments:   via students.portal_user_id join
academic_terms:         via students.portal_user_id → owner_user_id join
school_classes:         via students.portal_user_id → owner_user_id join
```

**3. Code Fixes (3 files)**

- **`supabase/functions/create-portal-account/index.ts`** — Change from updating `user_id` to updating `portal_user_id`. Change ownership check from `owner_user_id` to comparing against the `user_id` field (which is still the owner's ID at query time).
- **`src/hooks/usePortalSession.tsx`** — Change queries from email `ilike` match to `portal_user_id = auth.uid()` match.
- **`src/components/portal/gym/GymPortalSchedule.tsx`** and **`GymPortalMembership.tsx`** — These use `ownerId` from `gymMember.user_id`, which will need to come from `gymMember.owner_user_id` instead after the schema change.

---

### Security Analysis: Is Anything Compromised Right Now?

**Currently (before fix):**
- Portal login with email+password works (auth credentials are created correctly)
- But portal users who log in see **nothing** — all RLS blocks them because no portal policies exist
- The gym owner's data is **not exposed** to portal users — the database correctly rejects all queries
- The `create-portal-account` function is broken (references non-existent `owner_user_id` column), so no portal accounts have been successfully linked to members yet
- **No data leak is occurring** — the current state is broken but safe

**After fix:**
- Each portal user can only read their own single member/student record
- They can read class schedules and plans for their gym/school (read-only, same data all members of that gym can see)
- They absolutely cannot read other gyms' data, other members' data, invoices, accounting, CRM, or any business data
- The business owner's full dashboard access is completely unchanged

---

### Files to Change

| File | Change |
|---|---|
| New migration | Add `owner_user_id` + `portal_user_id` to `gym_members` and `students`; backfill `owner_user_id`; add portal RLS policies to 9 tables |
| `supabase/functions/create-portal-account/index.ts` | Fix ownership check to use `user_id` (current owner column); write to `portal_user_id` not `user_id` |
| `src/hooks/usePortalSession.tsx` | Query by `portal_user_id = auth.uid()` instead of email match; expose `owner_user_id` in returned objects |
| `src/components/portal/gym/GymPortalSchedule.tsx` | Use `member.owner_user_id` as the owner reference instead of `member.user_id` |
| `src/components/portal/gym/GymPortalMembership.tsx` | Same — use `owner_user_id` for filtering subscriptions |
| `src/components/portal/school/SchoolPortalFees.tsx` | Use `student.owner_user_id` for term filtering |
| `src/components/portal/school/SchoolPortalTimetable.tsx` | Same |

No data is at risk currently. The fix makes the portal functional while keeping all tenant data completely isolated.

