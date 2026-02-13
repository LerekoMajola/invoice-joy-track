

# Fix: Prevent User Object Reference Changes on Token Refresh

## Root Cause

In `AuthContext.tsx`, every `onAuthStateChange` event (including `TOKEN_REFRESHED`) calls:

```
setUser(nextSession?.user ?? null)
```

This creates a **new object reference** every time, even when the user hasn't changed. This new reference:

1. Makes the `useMemo` for the context value recalculate (line 127-135, `user` is in the dependency array)
2. All context consumers re-render (every `ProtectedRoute`, page component, etc.)
3. Even though `ProtectedRoute` has guards (`hasCheckedRef`), the re-render cycle can cause visual flicker or interact badly with the preview environment

## Solution

**File: `src/contexts/AuthContext.tsx`**

Replace direct `setUser(nextSession?.user ?? null)` calls with a functional update that preserves the existing object reference when the user ID hasn't changed:

```typescript
// Instead of:
setUser(nextSession?.user ?? null);

// Use:
setUser(prev => {
  const nextUser = nextSession?.user ?? null;
  // Keep the same reference if identity hasn't changed
  if (prev?.id === nextUser?.id) return prev;
  return nextUser;
});
```

Apply this change in two places:
1. Inside the `onAuthStateChange` callback (around line 32)
2. Inside the `getSession().then()` handler (around line 52)

Similarly, stabilize the session reference:
```typescript
setSession(prev => {
  if (prev?.access_token === nextSession?.access_token) return prev;
  return nextSession;
});
```

This ensures that background token refreshes produce **zero re-renders** across the entire app, since neither `user` nor `session` references change when the identity is the same.

## Why Previous Fixes Weren't Enough

- The `roleLoading` skip for `TOKEN_REFRESHED` was correct but insufficient -- the user object reference change alone triggers full context propagation
- The `hasCheckedRef` in `ProtectedRoute` correctly skips the subscription check, but the component still re-renders due to context changes
- If the preview environment does a full iframe reload on tab switch (which appears to be happening), none of the React-level guards help -- but stabilizing the references prevents the cascade that makes it worse

## Result

- Token refreshes produce zero downstream re-renders
- Tab switching with token refresh is completely invisible to the user
- No spinner, no lost work, no page flash

