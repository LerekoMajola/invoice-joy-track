
# Add Name, Surname, and Phone to Signup Form

## What Changes
The signup credentials step (the final step before account creation) will be updated to collect the user's **first name**, **surname**, **email**, and **phone number**. This information will be stored in the user's metadata so you can use it for follow-up marketing.

## How It Works
- Two new fields (First Name, Surname) appear above the email field
- A Phone Number field appears below the email field
- All four fields plus password are submitted together when creating the account
- The name, surname, and phone are saved to the user's `user_metadata` in the authentication system
- The admin Sign-ups tab will be updated to display these fields so you can see contact details at a glance

## Changes

### 1. Auth Page - Credentials Step
**File: `src/pages/Auth.tsx`**
- Add state variables: `firstName`, `surname`, `phone`
- Add First Name and Surname input fields (both required) above the email field
- Add Phone Number input field (optional) below email
- Include `first_name`, `surname`, and `phone` in the `user_metadata` when calling signup
- Add a User icon for name fields and Phone icon for the phone field

### 2. Admin Sign-ups Edge Function
**File: `supabase/functions/admin-get-signups/index.ts`**
- Extract `first_name`, `surname`, and `phone` from `user_metadata` in the response
- Return these fields alongside existing signup data

### 3. Admin Sign-ups Hook & Tab
**Files: `src/hooks/useAdminSignups.tsx`, `src/components/admin/SignupsTab.tsx`**
- Add `first_name`, `surname`, `phone` to the `AdminSignup` interface
- Display name and phone columns in the sign-ups table so you can see contact info for marketing follow-up

## Technical Details

### Data Storage
No new database tables needed. The name, surname, and phone are stored in the authentication system's `user_metadata` object, which is already accessible via the admin edge function.

### Files Modified
- `src/pages/Auth.tsx` - Add name/surname/phone fields to credentials step
- `supabase/functions/admin-get-signups/index.ts` - Return name/surname/phone from user metadata
- `src/hooks/useAdminSignups.tsx` - Update interface with new fields
- `src/components/admin/SignupsTab.tsx` - Show name and phone in the table
