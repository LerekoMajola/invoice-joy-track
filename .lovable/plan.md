
# Fix: Logout Loop When Session Expires

## Problem
You're stuck on the dashboard and can't log out. The auth logs show dozens of repeated "Session not found" (403) errors. Here's what's happening:

1. The 5-minute inactivity timer fires and tries to sign you out
2. The server session is already gone, so the sign-out call fails with 403
3. But locally the app still thinks you're logged in (stale session in memory)
4. The inactivity hook and any manual logout keep retrying -- all failing
5. You're stuck in a loop and never get redirected to the login page

## Solution
Force-clear the local session data when sign-out fails, so the app always redirects to the login page regardless of server response.

## Changes

### 1. Fix `src/contexts/AuthContext.tsx` -- Make `signOut` resilient
Update the `signOut` function to forcefully clear local storage and reset state even if the server call fails:

- Wrap `supabase.auth.signOut()` in a try/catch
- On failure, manually remove the Supabase session from `localStorage`
- Clear the `sessionStorage` admin role cache
- Reset `user`, `session`, and `isAdmin` state to null/false
- This ensures the app always transitions to a logged-out state

### 2. Fix `src/hooks/useInactivityLogout.tsx` -- Prevent duplicate logout calls
Add a guard to prevent the logout function from being called multiple times:

- Add a `loggingOutRef` flag that's set to `true` when logout starts
- Skip subsequent calls if already logging out
- This stops the rapid-fire 403 loop in the auth logs

### Files Modified
- `src/contexts/AuthContext.tsx` -- resilient signOut with local cleanup
- `src/hooks/useInactivityLogout.tsx` -- guard against duplicate logout calls
