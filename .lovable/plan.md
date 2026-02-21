

## Unified Login Page

### What Changes

Right now there are two login screens:
- `/auth` -- for gym owners / business users
- `/portal` -- has its own separate login form (PortalLogin component)

The goal: **everyone logs in at `/auth`**. After login, the system automatically sends them to the right place based on their account type. No user action needed -- it just works.

### How Users Experience It

1. A gym owner opens the app and lands on `/auth` -- logs in -- goes to the business dashboard
2. A gym member opens the app and lands on `/auth` -- logs in with their portal credentials -- goes to the member portal
3. No confusion, no separate URLs to remember

### Technical Changes

**File: `src/pages/Portal.tsx`**
- When no user is authenticated, instead of rendering the `<PortalLogin />` component, redirect to `/auth`
- This means visiting `/portal` without being logged in takes you to the unified login page
- Once logged in, portal users still land on `/portal` as before (the Auth.tsx redirect already handles this)

**File: `src/pages/Auth.tsx`**
- No changes needed -- the post-login redirect on lines 50-59 already checks `user.user_metadata?.portal_type` and sends portal users to `/portal`

**File: `src/components/portal/PortalLogin.tsx`**
- No deletion needed, but it will no longer be rendered (can be cleaned up later)

### What Stays the Same

- The `create-portal-account` Edge Function still provisions portal accounts with `portal_type` in metadata
- `ProtectedRoute.tsx` still blocks portal users from accessing business routes
- `usePortalSession.tsx` still resolves the correct member/student record after login
- The member portal UI at `/portal` is unchanged for authenticated users

### Summary of Edits

| File | Change |
|------|--------|
| `src/pages/Portal.tsx` | Replace `<PortalLogin />` with `<Navigate to="/auth" />` |

One line change. The separation logic is already built -- we just need to funnel everyone through the same door.

