
## The Problem: Stale Deployment + Fragile Error Check

### Why it's still failing

The edge function logs show the error at `index.ts:236:51`. In the updated code, line 236 is `if (!isAlreadyRegistered)` — not the `createUser` call. But in the **old code**, line 236 was the `createUser` await. This means the deployed function is still running the old version. The file was updated but the deployment did not propagate.

Additionally, the current check uses a string match on the error message:
```typescript
createError.message?.toLowerCase().includes('already registered')
```

This is fragile. Supabase auth errors have a `code` property that is guaranteed: `code: "email_exists"`. Using the code is far more reliable.

### The Fix: Two changes to the Edge Function

**1. Switch to `code`-based check (reliable)**

Replace:
```typescript
const isAlreadyRegistered = createError.message?.toLowerCase().includes('already registered') ||
  createError.message?.toLowerCase().includes('already exists')
```

With:
```typescript
const isAlreadyRegistered = 
  (createError as any).code === 'email_exists' ||
  createError.message?.toLowerCase().includes('already registered') ||
  createError.message?.toLowerCase().includes('already exists')
```

This checks the `code` first (most reliable), then falls back to message matching.

**2. Force redeploy**

The file will be saved and redeployed so the running function matches the code.

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/create-portal-account/index.ts` | Add `code === 'email_exists'` to the `isAlreadyRegistered` check; triggers fresh deployment |

No database changes, no UI changes — one small code improvement and a fresh deploy.
