

# Fix: Eliminate Loading Spinner on Page Reload / Tab Return

## Problem
When you switch tabs, the browser may fully unload the Lovable preview iframe. When you return, the app starts from scratch and must:
1. Restore the auth session from localStorage (fast, but async)
2. Check the admin role from the database (network call)
3. Check the subscription status from the database (network call)

All three block the UI with a full-screen spinner. Steps 2 and 3 are redundant for returning users whose status hasn't changed.

## Solution
Cache the subscription/module check result in `sessionStorage` so returning users skip the spinner entirely.

## Technical Changes

**File: `src/components/layout/ProtectedRoute.tsx`**

1. After a successful subscription check, store the user ID in `sessionStorage` (key: `subscription_checked_user`)
2. On mount, if `sessionStorage` already has the current user's ID cached, initialize `checkingSubscription` to `false` and skip the check entirely
3. Clear the cache on sign-out (already handled since sessionStorage clears on tab close, and we can clear explicitly too)

Key changes:
- Read from sessionStorage on mount to determine initial `checkingSubscription` state
- After successful check, write to sessionStorage
- The `hasCheckedRef` guard remains as a secondary in-memory guard

**File: `src/contexts/AuthContext.tsx`**

1. Cache the admin role result in `sessionStorage` after the role check completes
2. On mount, initialize `isAdmin` from the cached value so `roleLoading` can start as `false` for returning users
3. The role check still runs in the background to validate, but the UI isn't blocked

This means:
- First login: spinner shows briefly (unavoidable -- need to verify subscription)
- Returning to tab / page reload: content appears immediately, verification happens silently in background
- Sign out + sign in as different user: cache is invalidated, spinner shows again

## Result
- No more losing your work when switching tabs
- Page content appears instantly on return
- Security checks still run, just non-blocking for cached users
