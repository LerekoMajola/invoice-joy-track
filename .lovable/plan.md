

# Fix Password Reset: Switch to Built-In Email System

Replace the failing Resend-based password reset with the built-in authentication email system.

---

## What Changes

### 1. Update ResetPassword.tsx

In `handleRequestReset`, replace the edge function call with:

```
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
})
```

This removes the dependency on the custom edge function and Resend entirely.

### 2. Delete the edge function

Remove `supabase/functions/send-password-reset/index.ts` since it is no longer needed.

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ResetPassword.tsx` | Replace `supabase.functions.invoke('send-password-reset', ...)` with `supabase.auth.resetPasswordForEmail()` |
| `supabase/functions/send-password-reset/index.ts` | Delete |

---

## What Stays the Same

- The entire reset password page UI (request form, update password form, success screen)
- The recovery token detection logic in the useEffect hook
- The password update flow using `supabase.auth.updateUser({ password })`

