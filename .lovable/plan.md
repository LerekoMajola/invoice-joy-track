
## Portal: Switch from Magic Links to Real Credentials + Fix Build Error

### What the User Sees Right Now and Why
- The portal login shows "Send me a link" (magic-link flow). The user wants real email+password credentials instead.
- The URL shows `lovable.app` in the Lovable editor preview — this is only visible inside the Lovable development environment. The published URL is already `invoice-joy-track.lovable.app`. This can be connected to a custom domain in Settings → Domains to remove all Lovable references for end users.
- **Build error**: The PWA is rejecting the production build because the JS bundle is 5.27 MB and the cache limit is exactly 5 MB — just barely over.

---

### Fix 1: Build Error (1 file)

Raise `maximumFileSizeToCacheInBytes` in `vite.config.ts` from `5 * 1024 * 1024` (5 MB) to `6 * 1024 * 1024` (6 MB). The bundle is currently 5.27 MB so 6 MB gives comfortable headroom.

**File:** `vite.config.ts`

---

### Fix 2: Replace Magic Links with Real Email + Password Credentials

The same pattern already used for staff accounts will be replicated for portal users. When the gym owner clicks "Create Portal Access" on a member, or the school admin on a student/guardian:

1. A new backend function generates a random temporary password.
2. It creates a real auth account (email + password, pre-confirmed).
3. It stores the new `user_id` back on the `gym_members.user_id` or `students.user_id` column (these columns already exist).
4. It emails the member/guardian their login email + temporary password.
5. The portal login screen becomes a standard email + password form.

---

### New Backend Function: `create-portal-account`

Similar in structure to the existing `create-staff-account` function. Accepts:
- `memberId` (UUID) OR `studentId` (UUID)
- `portalType`: `'gym'` | `'school'`
- `name` (string)
- `email` (string)

Behaviour:
- Validates the caller owns the record (`gym_members.user_id` / `students.user_id` matches caller)
- If a portal auth account already exists for that email → returns an error with a toast "Account already exists"
- Generates a temp password, creates auth user, links `user_id`, sends a branded credentials email pointing to `/portal?type=gym` or `/portal?type=school`
- The email says "Your Gym Portal access" or "Your Parent Portal access" — no mention of Lovable anywhere

---

### Files to Change

| File | Change |
|---|---|
| `vite.config.ts` | Raise PWA cache limit to 6 MB |
| `supabase/functions/create-portal-account/index.ts` | **New** — backend function to create email+password portal accounts |
| `src/components/portal/PortalLogin.tsx` | Replace magic-link form with email + password sign-in form |
| `src/components/gym/MemberDetailDialog.tsx` | Replace "Send Portal Invite" (OTP) with "Create Portal Access" (calls new function) |
| `src/components/school/StudentDetailDialog.tsx` | Same — replace OTP invite with credential creation |

---

### What Portal Users Will Experience After the Fix

1. Gym owner opens a member's detail → clicks **"Create Portal Access"** → system creates an account and emails the member their login and temporary password.
2. Member opens `invoice-joy-track.lovable.app/portal` (or your custom domain `/portal`) — sees a clean **Email + Password** login form with the gym/school branding, zero Lovable references.
3. They log in → see only their own membership, schedule, and messages. No other members' data is accessible (enforced by RLS on the backend).

---

### Technical Details (Security)

- The new function uses the **service role key on the server** — the client never touches admin APIs.
- The `user_id` stored on `gym_members` and `students` is already used by existing RLS policies to restrict data access. Portal users can only read rows where `user_id = auth.uid()`.
- The portal login uses `supabase.auth.signInWithPassword()` — standard, secure, no magic tokens in URLs.
- If an account already exists for a member, the function returns a conflict response and the UI shows a toast.
