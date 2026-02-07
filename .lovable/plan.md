

# Add Change Password Feature to Settings

## What's Missing

Currently, the only way to change your password is through the "Forgot Password" flow on the login page, which sends an email link. There is no way for a logged-in user to change their password directly from within the app.

## What Gets Added

A new **"Account Security"** card in the Settings page that lets you change your password while logged in. It will include:

- Current password field (for verification)
- New password field
- Confirm new password field
- Validation (minimum 6 characters, passwords must match)
- Success/error feedback via toast messages

This card will appear at the top of the Settings page, since account security is a high-priority setting.

## How It Will Look

The card follows the same design pattern as the other Settings cards:
- A Lock icon with the title "Account Security"
- Description: "Change your account password"
- Three password fields stacked vertically
- A "Change Password" button at the bottom of the card

## File to Change

| File | Change |
|------|--------|
| `src/pages/Settings.tsx` | Add an "Account Security" card with a change password form |

## Technical Details

### Implementation approach

The change password form uses `supabase.auth.updateUser({ password })` to update the password. Before calling this, it:

1. Validates the new password is at least 6 characters
2. Confirms the new password matches the confirmation field
3. Verifies the current password by calling `supabase.auth.signInWithPassword()` with the user's email and current password -- this ensures only the actual user can change their password
4. On success, clears the form and shows a success toast
5. On failure, shows an appropriate error message

### Form state

Three new state variables: `currentPassword`, `newPassword`, `confirmNewPassword`, plus a `changingPassword` loading flag. These are local to the Settings component and reset after successful change.

### Placement

The Account Security card will be placed as the first card in the Settings page, before the Document Header card, making it easy to find.

