
# Fix: Pause Inactivity Timer When Tab Is Hidden

## Problem
The 5-minute inactivity timer keeps counting even when you switch to another browser tab. If you come back after 5 minutes, the app has already logged you out and done a hard page refresh (`window.location.href`), wiping any unsaved work. Additionally, the visibility-change session refresh can trigger unnecessary re-renders.

## Solution
1. **Pause the timer when the tab is hidden** -- only count inactivity while the tab is actually visible and you're not interacting with it
2. **Resume the timer (with remaining time) when you return** to the tab
3. **Remove the aggressive session refresh** on tab return (Supabase handles token refresh automatically via its internal timer; the manual call causes unnecessary state churn)

## Technical Changes

**File: `src/hooks/useInactivityLogout.tsx`**
- Add a `visibilitychange` listener inside the hook
- When the tab becomes hidden: clear the timeout and save how much time was remaining
- When the tab becomes visible again: restart the timeout with the remaining time
- This means the 5-minute clock only ticks while you're actually on the tab but idle

**File: `src/App.tsx`**
- Remove the `visibilitychange` handler that calls `supabase.auth.getSession()` on every tab return
- Keep the `unhandledrejection` handler for crash prevention
- Supabase's built-in auto-refresh handles token renewal, so the manual call is redundant and causes the "refresh" feeling on tab switch

## Result
- Auto-logout after 5 minutes of inactivity still works as expected
- Switching tabs no longer counts as inactivity
- Returning to the tab no longer triggers a session refresh that causes re-renders and lost state
