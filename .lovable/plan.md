
# Platform Admin Dashboard - Fix Admin Role Detection and Navigation

## Problem Summary
You're logged in as `admin@orionlabs.com` with `super_admin` role, but you're seeing the regular tenant dashboard instead of the Admin Console. The database confirms your role is set correctly, but there's a race condition in the authentication flow that causes incorrect redirects.

## Root Cause Analysis
1. **Race Condition**: When you log in, multiple functions compete to redirect you - both the login handler and the auth state listener try to check your role and navigate
2. **Async Role Loading**: The admin role check happens in a separate query that loads after authentication, creating a timing gap
3. **Premature Navigation**: The app may redirect to `/dashboard` before the role query completes

## Solution Approach

### Phase 1: Consolidate Auth and Role Loading
Update the `useAuth` hook to include admin role detection as part of the initial authentication flow, ensuring the role is loaded before navigation decisions are made.

**Changes to `src/hooks/useAuth.tsx`:**
- Add `isAdmin` state to the hook
- Fetch admin role during initial session check
- Only set `loading = false` after both auth AND role are loaded
- Export `isAdmin` alongside user and session

### Phase 2: Simplify Auth Page Navigation
Update `src/pages/Auth.tsx` to remove the duplicate role-checking logic and rely on a single source of truth.

**Changes:**
- Remove the `onAuthStateChange` redirect listener (it conflicts with manual login flow)
- Keep only the post-login redirect using the consolidated auth state
- Prevent race conditions by awaiting role check completion

### Phase 3: Update Protected Route Guards
Update `src/components/layout/AdminProtectedRoute.tsx` to use the consolidated `isAdmin` from `useAuth`.

**Changes:**
- Remove separate `useAdminRole` hook call
- Use `isAdmin` directly from `useAuth`
- Simplify loading state handling

### Phase 4: Clean Up Legacy Hook
The `useAdminRole` hook can still be kept for use in other components (like enabling/disabling admin features in the UI), but the protected route will no longer depend on it for critical navigation decisions.

## Technical Details

### Updated useAuth Hook Structure
```text
useAuth() returns:
  - user: User | null
  - session: Session | null
  - isAdmin: boolean
  - loading: boolean (true until BOTH auth AND role are loaded)
  - signOut: () => Promise<void>
```

### Authentication Flow After Fix
```text
1. User enters credentials
2. supabase.auth.signInWithPassword() called
3. On success, wait for useAuth to update
4. useAuth internally fetches role before setting loading=false
5. Auth.tsx checks isAdmin from useAuth
6. Navigate to /admin or /dashboard based on isAdmin
```

### Files to Modify
1. `src/hooks/useAuth.tsx` - Add admin role detection to the auth flow
2. `src/pages/Auth.tsx` - Simplify navigation logic, remove race conditions
3. `src/components/layout/AdminProtectedRoute.tsx` - Use consolidated auth state

## Testing Checklist
After implementation:
- [ ] Log out completely
- [ ] Log in with `admin@orionlabs.com`
- [ ] Verify you land on `/admin` dashboard
- [ ] Verify Tenants tab shows all business accounts
- [ ] Verify Subscriptions tab shows subscription management
- [ ] Log out and log in with a regular tenant account
- [ ] Verify regular users land on `/dashboard` and cannot access `/admin`
