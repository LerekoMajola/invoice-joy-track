

# Fix: Stop Loading Spinner on Tab Return

## Problem
When you switch tabs and come back, Supabase's automatic token refresh fires an `onAuthStateChange` event with type `TOKEN_REFRESHED`. The current code treats every auth event the same -- it sets `roleLoading = true`, which makes `loading = true` in the auth context, which causes the ProtectedRoute to show a full-screen spinner and re-run subscription checks. This is why you see the app "reset" to a loading state.

## Root Cause
In `AuthContext.tsx` line 36-37, every `onAuthStateChange` event (including `TOKEN_REFRESHED`) triggers `setRoleLoading(true)`, which cascades into the loading spinner across the entire app.

## Solution
Only trigger the role-loading state for events that actually change the user identity (sign in, sign out, user updated). Skip it for token refreshes since the user hasn't changed.

## Technical Changes

**File: `src/contexts/AuthContext.tsx`**

In the `onAuthStateChange` callback, check the event type before setting `roleLoading`:
- For `TOKEN_REFRESHED`: update the session/user references silently (no loading state) -- the user identity hasn't changed, so there's no need to re-check the admin role
- For `SIGNED_IN`, `SIGNED_OUT`, `USER_UPDATED`, etc.: keep the current behavior of setting `roleLoading = true` to re-check the admin role

```text
Before (simplified):
  onAuthStateChange(event, session) => {
    setUser(session?.user)    // always
    setRoleLoading(true)      // always -- THIS causes the spinner
  }

After:
  onAuthStateChange(event, session) => {
    setSession(session)
    setUser(session?.user)
    if (event !== 'TOKEN_REFRESHED') {
      // Only re-check role when user identity actually changes
      if (session?.user) setRoleLoading(true)
      else { setRoleLoading(false); setIsAdmin(false) }
    }
  }
```

No other files need changes. The inactivity logout and ProtectedRoute logic remain as-is.

## Result
- Returning to the tab after a token refresh will no longer show a loading spinner
- The page content stays exactly where you left it
- Admin role is still properly checked on initial login and user changes
- Inactivity auto-logout continues to work as before

