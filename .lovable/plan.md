
# Fix: Prevent Signup Without Completing Selection Steps

## The Problem

The signup flow has no validation guards, allowing users to create accounts without choosing a system type, package, or modules. There are two specific bugs:

1. **No validation in `handleAuth`**: The signup submission only checks email and password. It never verifies that `selectedSystem`, `selectedTier`, or `selectedModuleKeys` are set, so it happily creates an account with null/empty selections.

2. **Fallthrough to login form**: If `isLogin` is false but the signup step conditions don't match (e.g., credentials step without a selected system), the component falls through all the `if` blocks and renders the login form -- but since `isLogin` is still false, submitting that form runs the signup code path, bypassing all selection steps entirely.

## The Fix

Three changes to `src/pages/Auth.tsx`:

### 1. Add signup validation in `handleAuth`

Before the signup API call, check that required selections exist:
- `selectedSystem` must not be null
- `selectedModuleKeys` must have at least one entry
- If either is missing, show a toast error and redirect back to the system selection step

### 2. Add a guard on the credentials step rendering

The credentials step (line 396) currently only checks `signupStep === 'credentials'`. Add a condition that also requires `selectedSystem` to be set. If someone lands on credentials without a system selected, automatically redirect them back to the system step.

### 3. Add a fallback catch-all for signup

After all the signup step `if` blocks, before the login form renders, add a catch-all that redirects unmatched signup states back to the system selection step. This prevents the fallthrough-to-login-form bug.

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Add 3 validation guards described above |

## Technical Detail

**Change 1 -- in `handleAuth` (around line 89):**
Add before the `supabase.auth.signUp` call:
```text
if (!selectedSystem || selectedModuleKeys.length === 0) {
  toast.error('Please complete your package selection first');
  setSignupStep('system');
  setSubmitting(false);
  return;
}
```

**Change 2 -- credentials step guard (around line 396):**
Change the condition from:
```text
if (signupStep === 'credentials')
```
to:
```text
if (signupStep === 'credentials' && selectedSystem && selectedModuleKeys.length > 0)
```

**Change 3 -- catch-all fallback (after line 498, before the login form):**
Add a fallback when `!isLogin` but no step matched:
```text
// Fallback: if signup but no step matched, reset to system selection
return (reset to system selection step UI)
```

This calls `setSignupStep('system')` and renders the system selector, preventing any possibility of reaching the login form while in signup mode.
