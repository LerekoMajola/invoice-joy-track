
## Bug: Edit Subscription Dialog Shows Stale Data

### Root Cause

In `EditSubscriptionDialog.tsx`, lines 80–86 use `useState` (incorrectly) where `useEffect` is needed:

```tsx
// BROKEN — useState initializer only runs once, never re-runs when tenant changes
useState(() => {
  if (tenant?.subscription) {
    setPlan(tenant.subscription.plan);
    setStatus(tenant.subscription.status);
  }
});
```

Because the dialog component stays mounted in the DOM between opens, the four `useState` calls on lines 34–39 also only fire on the very first mount. When you click "Edit" for a different tenant (Leselihub after having opened another row), the component reuses its old state — hence "Free Trial / Trialing" appearing even though the database correctly stores `basic / active`.

### The Fix

Replace the broken `useState` call with a proper `useEffect` that depends on `[tenant, open]` so the form resets whenever the dialog opens for any tenant.

**File:** `src/components/admin/EditSubscriptionDialog.tsx`

```tsx
// Add useEffect to imports
import { useState, useEffect } from 'react';

// Replace the broken useState block with:
useEffect(() => {
  if (tenant?.subscription) {
    setPlan(tenant.subscription.plan);
    setStatus(tenant.subscription.status);
    setBillingNote(tenant.subscription.billing_note || '');
    setBillingOverride(
      tenant.subscription.billing_override != null
        ? String(tenant.subscription.billing_override)
        : ''
    );
  }
}, [tenant, open]);
```

The dependency on `open` ensures values reset every time the sheet opens, and the dependency on `tenant` ensures correct values load when a different row is selected.

### Files Changed

| File | Change |
|---|---|
| `src/components/admin/EditSubscriptionDialog.tsx` | Replace `useState` reset with `useEffect`; add `useEffect` to import |

No database changes needed — the database already has the correct values.
