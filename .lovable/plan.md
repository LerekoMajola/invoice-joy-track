

# Security Hardening: Auth Flow Protection

## What This Fixes

Three security gaps in the current auth enforcement:

### 1. PaymentRequired page is unprotected at the route level
The `/payment-required` route is NOT wrapped in `ProtectedRoute`. While it does check auth internally, an unauthenticated visitor can momentarily see the loading spinner and page structure before any redirect happens. Every non-public page must be gated at the router level.

**Fix:** Wrap `/payment-required` in `ProtectedRoute` in `App.tsx`, and remove the redundant internal auth check from the page itself.

### 2. Landing page does not redirect authenticated users
If a logged-in user visits `/` (the landing page), they see the marketing site with "Sign In" and "Start Free Trial" buttons. This is confusing and could lead someone to think they are not authenticated. Authenticated users should be sent straight to their dashboard.

**Fix:** Add an auth-aware redirect on the Landing page -- if `user` exists, redirect to `/dashboard` (or `/admin` for admins). This means a signed-in user can never land on the marketing page and think they need to sign in again.

### 3. ProtectedRoute fails open on errors
Line 98 of `ProtectedRoute.tsx` has `setHasSubscription(true)` in the catch block, meaning if the subscription check throws an error (network issue, database problem), the user is allowed through anyway. Security should fail closed -- block access and show an error state rather than granting access.

**Fix:** Change the error handler to block access and show a retry option instead of silently granting entry.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Wrap `/payment-required` route in `ProtectedRoute` |
| `src/pages/PaymentRequired.tsx` | Remove internal auth redirect logic (now handled by route guard) |
| `src/pages/Landing.tsx` | Add auth check: redirect signed-in users to `/dashboard` or `/admin` |
| `src/components/layout/ProtectedRoute.tsx` | Change error handling from fail-open to fail-closed with a retry UI |

## No Changes Needed

- Auth form (`/auth`) -- already works correctly
- `AdminProtectedRoute` -- already properly guarded
- Sidebar / BottomNav -- already behind protected routes
- AuthContext -- already handles session state correctly

---

## Technical Details

### App.tsx Route Change
```text
Before:  <Route path="/payment-required" element={<PaymentRequired />} />
After:   <Route path="/payment-required" element={<ProtectedRoute><PaymentRequired /></ProtectedRoute>} />
```

### Landing Page Auth Redirect
Add a simple check at the top of the Landing component:
- Import `useAuth` and `Navigate` from react-router
- If `loading` is true, show nothing (or a spinner)
- If `user` exists and `isAdmin`, redirect to `/admin`
- If `user` exists, redirect to `/dashboard`
- Otherwise render the landing page normally

This ensures that no authenticated user ever sees a "Sign In" button when they are already signed in.

### ProtectedRoute Error Handling
Replace the catch block's `setHasSubscription(true)` (fail-open) with:
- Set a new `error` state to `true`
- In the render, if `error` is true, show a simple error card with a "Try Again" button that re-runs the subscription check
- The user is never granted access when the system cannot verify their subscription status

### PaymentRequired Cleanup
Since the route is now wrapped in `ProtectedRoute`, the page no longer needs to handle the case where `user` is null. The `ProtectedRoute` guarantees a valid user before the page ever renders. Remove any redundant unauthenticated redirect logic from the component.
