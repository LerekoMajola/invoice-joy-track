

# Fix Screen Freeze + Add 5-Minute Inactivity Auto-Logout

## Problem

Two related issues:
1. **Screen freezes/refreshes when switching to another website** -- The app runs as a PWA with `display: standalone`. When the browser suspends the app in the background and restores it, stale state or unhandled promise rejections can cause the app to crash and reload, losing unsaved work.
2. **No inactivity timeout** -- The session stays active indefinitely, so there's no graceful logout for idle users.

## Solution

### 1. Prevent crash on tab/app resume

Add a global `unhandledrejection` handler in `App.tsx` to catch stray promise errors (e.g., failed token refreshes when the app wakes up) and prevent them from crashing the page. Also handle the `visibilitychange` event to gracefully refresh the session when the app comes back to the foreground instead of letting stale requests crash.

### 2. Add 5-minute inactivity auto-logout

Create an `useInactivityLogout` hook that:
- Tracks user activity (touch, click, keypress, scroll)
- Resets a 5-minute timer on each activity
- When the timer expires, calls `signOut()` and redirects to `/auth`
- Shows a toast notification so the user knows why they were logged out

This hook will be used inside the `AuthProvider` so it applies globally to all authenticated users.

---

## Technical Details

### Files Changed

| File | Change |
|------|--------|
| `src/hooks/useInactivityLogout.tsx` | **New** -- hook that monitors user activity and triggers logout after 5 minutes of inactivity |
| `src/contexts/AuthContext.tsx` | **Update** -- integrate the inactivity hook for authenticated users |
| `src/App.tsx` | **Update** -- add global `unhandledrejection` handler and `visibilitychange` session refresh |

### `useInactivityLogout` Hook

```text
- Listen for: touchstart, mousedown, keydown, scroll
- On any event: reset a 5-minute (300,000ms) setTimeout
- On timeout: call signOut(), navigate to /auth, show toast "Logged out due to inactivity"
- Cleanup: remove listeners and clear timeout on unmount
- Only active when user is authenticated
```

### `App.tsx` Changes

- Add a `useEffect` with a `window.addEventListener('unhandledrejection', ...)` handler that logs the error and prevents the default crash behavior
- Add a `visibilitychange` listener that calls `supabase.auth.getSession()` when the app returns to the foreground, ensuring a fresh token is available instead of letting a stale refresh fail

### `AuthContext.tsx` Changes

- Import and call `useInactivityLogout(user, signOut)` inside `AuthProvider` so the timer is active whenever a user is logged in
- The hook will handle navigation internally using `window.location` (since it's outside the Router)

