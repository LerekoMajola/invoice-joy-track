

# Staff Login Credentials on Creation

## Problem

When you add a staff member, the system only saves their details in a database record. It does not create an actual login account, so there are no login credentials to display.

## Solution

Create a backend function that generates a real user account with a temporary password when a staff member is added. After creation, display the login credentials (email + temporary password) in a dialog so you can share them with the staff member.

---

## Technical Details

### 1. New Edge Function: `create-staff-account`

A backend function that:
- Receives staff member details (name, email) and the staff record ID
- Creates an auth user via the admin API with a generated temporary password (8-char alphanumeric)
- Links the new auth user ID back to the `staff_members.user_id` column
- Sets the staff status to `active`
- Returns the temporary password to the caller
- Requires authentication and verifies the caller owns the staff record

### 2. Update `AddStaffDialog.tsx`

After successfully creating the staff record:
- Call the `create-staff-account` edge function
- On success, show a **"Login Credentials"** dialog displaying the email and temporary password
- Include a "Copy" button for easy sharing
- Warn that the password should be changed on first login

### 3. Update `useStaff.tsx`

- Add a `createStaffAccount` function that calls the edge function
- Update the `createStaff` flow to return the temporary password from the edge function

### 4. New Component: `StaffCredentialsDialog.tsx`

A dialog that shows:
- Staff member name
- Login email
- Temporary password (with copy button)
- A note: "Please share these credentials securely. The staff member should change their password on first login."

---

## Flow

```text
User clicks "Add Staff"
  --> Fills form, clicks submit
  --> Staff record created in database
  --> Edge function called to create auth account
  --> Temporary password generated
  --> Credentials dialog shown with email + password
  --> User copies/shares credentials with staff member
```

## Files

| File | Action |
|------|--------|
| `supabase/functions/create-staff-account/index.ts` | New -- edge function to create auth user |
| `src/components/staff/StaffCredentialsDialog.tsx` | New -- dialog to display login details |
| `src/components/staff/AddStaffDialog.tsx` | Update -- call edge function after creation, show credentials dialog |
| `src/components/staff/index.ts` | Update -- export new component |

