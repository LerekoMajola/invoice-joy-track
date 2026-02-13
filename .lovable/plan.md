

# Fix: Stop ProtectedRoute From Re-checking on Token Refresh

## Problem
The `ProtectedRoute` component's `checkSubscription` function depends on the `user` object (`useCallback(..., [user])`). Every time a token refresh happens, `setUser()` in AuthContext creates a new user object reference (even though the user ID hasn't changed). This causes:

1. `checkSubscription` to be recreated (new reference)
2. The `useEffect` watching `checkSubscription` to re-run
3. `setCheckingSubscription(true)` to trigger
4. The full-screen loading spinner to appear

## Solution
Change the dependency from `user` (object reference) to `user?.id` (stable string) so the subscription check only re-runs when the actual user identity changes, not on background token refreshes.

## Technical Changes

**File: `src/components/layout/ProtectedRoute.tsx`**

1. Change `checkSubscription`'s `useCallback` dependency from `[user]` to `[user?.id]` (line 134)
2. Inside `checkSubscription`, access `user` via a ref or restructure to use `user?.id` for the query and avoid stale closures -- or simply gate the function to only run when `user` exists at call time
3. Add a `hasChecked` ref to prevent re-running the subscription check if it already succeeded for the same user, so returning from another tab never re-triggers it

These changes ensure that once the subscription is verified for a user, switching tabs and returning will never show the spinner again.
