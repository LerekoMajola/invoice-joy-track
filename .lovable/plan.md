
## Fix "Build Your Own Custom Package" Link on Landing Page

### Problem

The "Or build your own custom package" link on the landing/pricing page navigates to `/auth` with no query parameters. This lands the user on the login form instead of the signup flow's custom module builder.

### Fix

**File: `src/components/landing/PricingTable.tsx` (line 163)**

Change the link to pass the currently selected system type AND a `custom=true` parameter:
```
/auth?system=business&custom=true
```
The `activeSystem` state already tracks which vertical tab is selected, so this will be dynamic (e.g., `/auth?system=legal&custom=true`).

**File: `src/pages/Auth.tsx` (around line 41-48)**

Update the `useEffect` that reads URL params to also check for `custom=true`. When present:
- Set `isLogin` to `false` (signup mode)
- Set the `selectedSystem` from the `system` param
- Set `signupStep` to `'custom-modules'` (skip straight to the module builder)

### Files to Modify

| File | Change |
|------|--------|
| `src/components/landing/PricingTable.tsx` | Update the Link `to` prop to include `system={activeSystem}&custom=true` |
| `src/pages/Auth.tsx` | Read `custom` search param; if true, jump to `custom-modules` step instead of `package` |
