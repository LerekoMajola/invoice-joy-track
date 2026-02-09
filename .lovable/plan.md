

# Clean Up Billing Page: Remove Usage Tracking and Modules Section

## What Changes

The Billing page currently has 4 sections stacked vertically, making it overwhelming:
1. Subscription Status card
2. Trial Warning banner
3. **Usage Meter** (clients/quotes/invoices progress bars) -- REMOVE
4. Payment Section (M-Pesa, Bank Transfer, "I've Made Payment")
5. **Your Modules** (toggle switches for each module) -- REMOVE

After cleanup, the Billing page will only show:
- Subscription status with trial info
- Payment instructions and the "I've Made Payment" button

This makes the page focused on what matters: knowing your status and making payments.

## What Gets Removed vs Kept

**Removed from Billing page:**
- `UsageMeter` component rendering (line 149 in Billing.tsx)
- "Your Modules" entire section (lines 278-339 in Billing.tsx)
- Imports for `UsageMeter`, `useModules`, `Switch`, module-related icons, and `formatMaluti` (if no longer needed)
- The `monthlyTotal`, `activeModuleIds`, `filteredModules` logic

**Kept (still used elsewhere):**
- `useModules` hook -- still used by Sidebar, BottomNav, MoreMenuSheet for navigation gating
- `useSubscription` hook -- still used for trial/status/systemType across the app
- `UsageMeter` and `UpgradePrompt` component files -- kept but unused (can delete)
- The monthly total display will be removed from the status card since it depends on modules

**Files deleted:**
- `src/components/subscription/UsageMeter.tsx`
- `src/components/subscription/UpgradePrompt.tsx`

## Technical Details

### Files Modified

| File | Change |
|------|--------|
| `src/pages/Billing.tsx` | Remove UsageMeter, remove modules section, remove monthly total display, remove unused imports (useModules, Switch, formatMaluti, Package, etc.) |
| `src/components/subscription/UsageMeter.tsx` | Delete file |
| `src/components/subscription/UpgradePrompt.tsx` | Delete file |

### Billing.tsx After Cleanup

The page will contain:
1. **Subscription Status** -- shows badge (Active/Trial/Expired) and trial days remaining
2. **Trial Warning** -- only appears during trial period
3. **Make a Payment** -- reference code, M-Pesa steps, bank transfer details, "I've Made Payment" button

The `useSubscription` hook is still imported for status/trial info. The `useModules` import and all module-related code is removed from this page.

### What Stays Untouched

- `useModules` hook -- Sidebar and BottomNav still use it for navigation filtering
- `useSubscription` hook -- used broadly, only the usage/limits parts become unused exports (harmless)
- No database changes needed

