

## Send Staff Credentials via Email

### What Changes

**1. Auto-email credentials on staff creation**
When you add a staff member, the system will automatically send them an email with their login credentials (email + temporary password) right after creating their account. No more manual copying needed.

**2. Resend credentials for existing staff**
A new "Resend Credentials" button will appear in the Staff Detail Dialog for staff members who already have accounts. This will generate a new temporary password, update their account, and email them the fresh credentials.

---

### Technical Details

**Modified: `supabase/functions/create-staff-account/index.ts`**
- After creating the auth user and generating the temp password, send an email via Resend with the login credentials
- The email includes the staff member's email address, temporary password, and a link to the login page
- Uses the existing RESEND_API_KEY secret (already configured)

**New: `supabase/functions/resend-staff-credentials/index.ts`**
- Accepts a `staffMemberId` in the request body
- Verifies the caller owns the staff record
- Confirms the staff member has a linked auth account (`user_id` exists)
- Generates a new temporary password, updates the auth user's password via `admin.updateUserById`
- Sends the new credentials via Resend email
- Returns success/failure

**Modified: `src/components/staff/StaffDetailDialog.tsx`**
- Add a "Resend Credentials" button in the action bar (visible only for staff with linked accounts, i.e. those with `user_id`)
- The button calls `supabase.functions.invoke('resend-staff-credentials')` and shows a success/error toast
- Need to extend `StaffMember` interface to include `userId` so the UI knows if an account exists

**Modified: `src/hooks/useStaff.tsx`**
- Map the `user_id` column from the database to `userId` on the `StaffMember` interface so the detail dialog knows whether the staff member has a linked account

**Config: `supabase/config.toml`**
- Add `[functions.resend-staff-credentials]` with `verify_jwt = false` (auth is validated in-code)

**Email template** (used by both functions):
- Clean branded HTML email from "Orion Labs"
- Shows the staff member's name, email, and temporary password
- Includes a "Login Now" button linking to the app
- Security notice to change password on first login

