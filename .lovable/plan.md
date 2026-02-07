

# Enable Auto-Confirm and Prevent Duplicate Email Signups

## Overview

Two changes: enable auto-confirm so users can sign in immediately after signup (no email verification), and properly detect duplicate email addresses during signup.

## What Changes

### 1. Enable Auto-Confirm

Use the auth configuration tool to turn on auto-confirm for email signups. This means new users get a session immediately upon signup -- no confirmation email needed.

### 2. Handle Duplicate Email Detection

With auto-confirm enabled, the backend does NOT return an error when someone signs up with an existing email (this is by design to prevent email enumeration attacks). Instead, it returns a user object with an **empty `identities` array**. The code needs to detect this and show a friendly error.

### 3. Update Signup Success Flow

Currently the code has two branches:
- `data.user && !data.session` -- assumes email confirmation is required (shows "check your email" toast)
- `data.user && data.session` -- treats as auto-confirm fallback

With auto-confirm always on, the primary path becomes `data.user && data.session`. The "check your email" branch becomes irrelevant and should be removed. On successful signup with a session, the code should immediately save the user's module selections and redirect to the dashboard.

## File to Change

| File | Change |
|------|--------|
| Auth configuration | Enable auto-confirm for email signups |
| `src/pages/Auth.tsx` | Fix duplicate email detection and simplify signup success handling |

## Technical Details

### Duplicate Email Detection

```text
// After supabase.auth.signUp returns:
if (data.user && data.user.identities?.length === 0) {
  // Email already exists - no new identity was created
  toast.error('This email is already registered. Please login instead.');
  return;
}
```

### Simplified Signup Success

```text
// With auto-confirm, successful signup always returns a session
if (data.user && data.session) {
  await saveSignupData(data.user.id);
  toast.success('Account created! Welcome aboard.');
}
```

### Remove Dead Code

The `data.user && !data.session` branch (email confirmation flow) will be removed since auto-confirm is now always on. The "check your email" toast message and the related state resets are no longer needed.

