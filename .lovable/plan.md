
## The Real Problem: Portal Users Can Access the Business Dashboard

### What Is Happening

When a gym member signs in at `/portal`, the `PortalLogin` component calls `supabase.auth.signInWithPassword`. This creates a **shared browser session** — the same session used by business owners. There is no distinction at the session level between a portal user and a business user.

When a portal user navigates to `/dashboard`:
1. `AuthContext` sees a logged-in user — ✅ passes
2. `ProtectedRoute` sees a logged-in user — ✅ passes
3. `ProtectedRoute` then finds **no subscription** for this portal user, so it **creates a brand-new free trial subscription** for them and assigns all platform modules
4. The full business dashboard renders — the gym member can see Clients, Invoices, Accounting, CRM, etc.

This is the exact bug shown in the screenshot.

### Root Cause

`ProtectedRoute` has no concept of portal users. It only checks `if (!user)`. Portal users are real authenticated users, so they pass that check and get treated as business owners.

### The Fix: Two-Layer Defence

**Layer 1 — ProtectedRoute: block portal users at the gate**

The `ProtectedRoute` must detect when the logged-in user is a portal user and redirect them to `/portal` instead of letting them through. A portal user is identified by their `user_metadata.portal_type` being set (the edge function sets this: `{ full_name: name, portal_type: portalType }`).

```typescript
// In ProtectedRoute.tsx — add before the subscription check:
const portalType = user.user_metadata?.portal_type;
if (portalType === 'gym' || portalType === 'school') {
  return <Navigate to="/portal" replace />;
}
```

**Layer 2 — Auth page: redirect portal users to `/portal`**

The `Auth` page currently redirects all logged-in users to `/dashboard`. A portal user who visits `/auth` would also get redirected there. The redirect must also check for portal users:

```typescript
// In Auth.tsx — change the redirect logic:
if (isAdmin) {
  navigate('/admin', { replace: true });
} else if (user.user_metadata?.portal_type) {
  navigate('/portal', { replace: true });
} else {
  navigate('/dashboard', { replace: true });
}
```

**Layer 3 — Database safety net (already in place)**

The RLS policies from the previous migration already ensure portal users cannot read business data tables (invoices, clients, accounting, etc.) — those policies check `auth.uid() = user_id` against the business owner's ID. A portal user's auth UID will never match a business owner's user_id, so even if they somehow reach `/dashboard`, all data queries return empty results. This is the fail-safe that was already working.

### Why This Is the Correct and Minimal Fix

| Approach | Verdict |
|---|---|
| Block in `ProtectedRoute` via `user_metadata.portal_type` | ✅ Correct — stops the redirect, prevents free trial creation |
| Block in `Auth.tsx` redirect | ✅ Correct — prevents portal users who visit `/auth` from going to dashboard |
| Database RLS (already done) | ✅ Already in place — provides a data-layer safety net |
| Creating a separate Supabase project | ❌ Not needed — metadata check is sufficient |

### Files to Change

| File | Change |
|---|---|
| `src/components/layout/ProtectedRoute.tsx` | After auth resolves, check `user.user_metadata?.portal_type` — if set, redirect to `/portal` instead of allowing access |
| `src/pages/Auth.tsx` | In the redirect-after-login effect, check `user_metadata.portal_type` and redirect portal users to `/portal` |

No database changes needed. No edge function changes needed. The `user_metadata.portal_type` field is already being set correctly by the `create-portal-account` edge function.

### What This Prevents

After this fix:
- A portal user logging in at `/portal` stays on `/portal` — the portal session hook resolves their gym/school record and shows their personal portal
- If a portal user manually navigates to `/dashboard`, `/invoices`, `/accounting`, etc., `ProtectedRoute` immediately redirects them back to `/portal`
- If a portal user visits `/auth`, they are redirected to `/portal` not `/dashboard`
- No free trial subscriptions are ever created for portal users
- No platform modules are ever assigned to portal users
- RLS still ensures zero data access even if any edge case gets through
