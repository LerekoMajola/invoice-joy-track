
## Menu Cleanup: Invoices, Delivery Notes, Profitability, and SMS Defaults

### 1. Restore Invoices as a permanent nav item (not optional)

Currently, "Invoices" is gated behind `optionalFeature: 'invoices'`, so it only shows when toggled on in Settings. This will be changed to always visible (no optional feature gate) in:
- **Sidebar** (`src/components/layout/Sidebar.tsx`) -- remove `optionalFeature: 'invoices'`
- **BottomNav** (`src/components/layout/BottomNav.tsx`) -- remove `optionalFeature: 'invoices'`
- **MoreMenuSheet** (`src/components/layout/MoreMenuSheet.tsx`) -- remove Invoices entry (it's now in main nav)

### 2. Move Delivery Notes inside the Invoices page as a tab

Instead of a separate nav item, Delivery Notes becomes a tab within the Invoices page:
- **Sidebar** -- remove the "Delivery Notes" nav entry
- **MoreMenuSheet** -- remove the "Delivery Notes" menu entry
- **BottomNav** -- remove from `moreRoutes` list
- **Invoices page** (`src/pages/Invoices.tsx`) -- wrap existing content in a Tabs component with two tabs: "Invoices" (existing content) and "Delivery Notes" (embed the DeliveryNotes page content)
- The `/delivery-notes` route in `App.tsx` stays for backward compatibility but the primary access is now through the Invoices tab

### 3. Move Profitability inside the Accounting page as a tab

Instead of a separate nav item, Profitability becomes a tab within Accounting:
- **Sidebar** -- remove the "Profitability" nav entry
- **MoreMenuSheet** -- remove the "Profitability" menu entry
- **BottomNav** -- remove from `moreRoutes` list
- **Accounting page** (`src/pages/Accounting.tsx`) -- add a 6th tab "Profitability" that lazy-loads the Profitability page content
- The `/profitability` route stays for backward compatibility

### 4. SMS notifications unchecked by default

The defaults in `useNotificationPreferences.tsx` already have `sms: false` for all categories and `sms_enabled: false`. This is already correct -- no changes needed here. SMS is off by default across all verticals.

### Technical Details

**Files to modify:**

| File | Change |
|------|--------|
| `src/components/layout/Sidebar.tsx` | Remove Invoices optional gate, remove Delivery Notes and Profitability entries |
| `src/components/layout/BottomNav.tsx` | Remove Invoices optional gate, clean up moreRoutes |
| `src/components/layout/MoreMenuSheet.tsx` | Remove Delivery Notes and Profitability entries |
| `src/pages/Invoices.tsx` | Add top-level Tabs with "Invoices" and "Delivery Notes" tabs |
| `src/pages/Accounting.tsx` | Add "Profitability" as 6th tab (grid-cols-5 becomes grid-cols-6) |

**No database or backend changes required.**
