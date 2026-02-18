

## Fix: Payment Required Page Shows Blank White Screen

### Root Cause
The `/payment-required` route is wrapped in `ProtectedRoute`. When a user's trial expires, `ProtectedRoute` detects `needsPayment=true` and renders `<Navigate to="/payment-required">`. But since PaymentRequired is *inside* ProtectedRoute, it triggers the same check again, creating a redirect loop. The beautiful PaymentRequired design never actually renders -- the user just sees a white screen.

### The Fix

**File: `src/App.tsx`**

Remove the `ProtectedRoute` wrapper from the `/payment-required` route. PaymentRequired already has its own authentication guard via `useAuth` and its own subscription check via `useSubscription`, so it doesn't need ProtectedRoute.

Change:
```tsx
<Route path="/payment-required" element={<ProtectedRoute><PaymentRequired /></ProtectedRoute>} />
```
To:
```tsx
<Route path="/payment-required" element={<PaymentRequired />} />
```

**File: `src/pages/PaymentRequired.tsx`**

Add a minimal auth guard so unauthenticated users hitting `/payment-required` directly get redirected to `/auth`:

- If `useAuth()` is still loading, show a branded loading state (with the gradient background, not a white page)
- If no user, redirect to `/auth`
- If user has no expired trial (`!needsPayment`), redirect to `/dashboard` (already implemented)

This way:
- Expired-trial users see the full payment page immediately
- Unauthenticated users go to login
- Active users go to dashboard
- No redirect loop

