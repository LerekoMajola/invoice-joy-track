
## Client-Facing Portal: GymPro Member App + EduPro Parent App

### What This Is
A separate, mobile-first `/portal` route that gym members and school parents/guardians can access from their phone. It is completely isolated from the main tenant dashboard. The gym/school business owner does NOT manage this — it is for their end-customers.

There are two distinct portal experiences on the same `/portal` route, distinguished by a token/invite mechanism:
- **GymPro Member Portal**: gym members view their membership, class schedule, attendance, and can message the gym.
- **EduPro Parent Portal**: school parents/guardians view their child's schedule, fee balance, term dates, and can message the school.

---

### Access / Authentication Strategy

Portal users are NOT standard platform subscribers. They use **passwordless magic-link login** via their email address (the same email stored on their gym_member or student/guardian record).

Flow:
1. Gym/school owner clicks "Send Portal Invite" on a member or student record.
2. System calls `supabase.auth.signInWithOtp({ email })`, sending a magic link.
3. The link contains a `portal_type` query param (`?portal=gym` or `?portal=school`) so the portal knows which view to render.
4. On arrival at `/portal`, the user is authenticated. The portal queries their data by matching `auth.user().email` against `gym_members.email` or `students.guardian_email`.

No passwords, no signup form — just one click from their email inbox.

---

### Database Changes (New Tables)

**`portal_messages`** — real-time messaging between portal users and the business
```
id, created_at,
sender_type (text: 'member' | 'guardian' | 'business'),
sender_id (text — auth user id or business owner id),
recipient_owner_id (uuid — the gym/school owner's user_id),
portal_type (text: 'gym' | 'school'),
reference_id (uuid — gym_member.id or student.id),
message (text),
is_read (boolean, default false)
```

RLS: Portal users can only read/write messages where `sender_id = auth.uid()` OR where the `recipient_owner_id` matches the row AND the authenticated user's email matches the linked member/guardian.

---

### New Files to Create

**Pages:**
- `src/pages/Portal.tsx` — root shell; detects `portal_type` from URL or session, renders correct sub-portal

**Portal Components:**
- `src/components/portal/PortalLogin.tsx` — magic-link request form (email input + "Send me a link" button)
- `src/components/portal/PortalLayout.tsx` — mobile-first layout with bottom nav for portal pages
- `src/components/portal/gym/GymMemberPortal.tsx` — main gym portal home: membership card + quick stats
- `src/components/portal/gym/GymPortalSchedule.tsx` — weekly class timetable view (read-only)
- `src/components/portal/gym/GymPortalMembership.tsx` — current plan, expiry, freeze status
- `src/components/portal/school/SchoolParentPortal.tsx` — main parent portal home
- `src/components/portal/school/SchoolPortalFees.tsx` — fee balance, payment history per term
- `src/components/portal/school/SchoolPortalTimetable.tsx` — child's class timetable (read-only)
- `src/components/portal/shared/PortalMessaging.tsx` — real-time messaging thread

**Hooks:**
- `src/hooks/usePortalSession.tsx` — resolves the logged-in portal user to their gym_member or student record by email matching

**Business-side components (triggers sending invite):**
- Add "Send Portal Invite" button inside `MemberDetailDialog.tsx` (gym) and `StudentDetailDialog.tsx` (school) — calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: '/portal?type=gym' }})`

---

### Modified Files

- `src/App.tsx` — add `/portal` public route (no ProtectedRoute wrapper, uses its own auth)
- `src/components/gym/MemberDetailDialog.tsx` — add "Send Portal Invite" button
- `src/components/school/StudentDetailDialog.tsx` — add "Send Portal Invite" button

---

### Portal Feature Breakdown

**GymPro Member Portal** (4 screens via bottom tab nav):
1. **Home** — Welcome card with member name, member number, current status badge (Active/Frozen/Expired). Shows expiry date and days remaining.
2. **Membership** — Active plan details: plan name, start/end dates, payment status, freeze history, auto-renew status.
3. **Classes** — Read-only weekly grid of all gym classes (same data as `gym_class_schedules`). Tapping a class shows description, instructor, duration, and capacity.
4. **Messages** — Simple message thread between member and gym staff. Real-time via Supabase Realtime on `portal_messages`.

**EduPro Parent Portal** (4 screens via bottom tab nav):
1. **Home** — Child's name, class, term info (current term name, start/end dates), overall fee balance summary.
2. **Fees** — Breakdown per term: what is owed, what has been paid, outstanding balance. Shows each payment with date and amount.
3. **Timetable** — Child's class timetable grid filtered to their class (read-only, same data as `timetable_entries`).
4. **Messages** — Message thread with the school office.

---

### Technical Details

**RLS for `portal_messages`:**
```sql
-- Portal users can insert their own messages
CREATE POLICY "portal_messages_insert" ON portal_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid()::text);

-- Portal users can read messages in their thread
CREATE POLICY "portal_messages_select" ON portal_messages
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()::text
    OR recipient_owner_id = auth.uid()
  );
```

**`usePortalSession` hook logic:**
```typescript
// After signIn via magic link, get the current user
const { data: { user } } = await supabase.auth.getUser();

// For gym portal: match email to gym_members
const { data: member } = await supabase
  .from('gym_members')
  .select('*')
  .ilike('email', user.email)
  .single();

// For school portal: match email to students.guardian_email
const { data: student } = await supabase
  .from('students')
  .select('*')
  .ilike('guardian_email', user.email)
  .single();
```

**Real-time messaging:**
```typescript
supabase.channel('portal-messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'portal_messages' }, handler)
  .subscribe();
```

**Portal type detection priority:**
1. URL query param: `/portal?type=gym`
2. Stored in localStorage after first successful login
3. Falls back to: if a gym_member record found → gym; if student found → school

---

### Files Summary

| File | Action |
|---|---|
| `supabase/migrations/[ts]_portal.sql` | New — creates `portal_messages` table + RLS |
| `src/pages/Portal.tsx` | New |
| `src/components/portal/PortalLogin.tsx` | New |
| `src/components/portal/PortalLayout.tsx` | New |
| `src/components/portal/gym/GymMemberPortal.tsx` | New |
| `src/components/portal/gym/GymPortalSchedule.tsx` | New |
| `src/components/portal/gym/GymPortalMembership.tsx` | New |
| `src/components/portal/school/SchoolParentPortal.tsx` | New |
| `src/components/portal/school/SchoolPortalFees.tsx` | New |
| `src/components/portal/school/SchoolPortalTimetable.tsx` | New |
| `src/components/portal/shared/PortalMessaging.tsx` | New |
| `src/hooks/usePortalSession.tsx` | New |
| `src/App.tsx` | Modified — add `/portal` route |
| `src/components/gym/MemberDetailDialog.tsx` | Modified — add invite button |
| `src/components/school/StudentDetailDialog.tsx` | Modified — add invite button |
