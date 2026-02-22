

## Custom Package Builder: Base Package + Add-ons Model

### Current Behavior
The custom package builder shows all modules individually with their own prices. Only `core_crm` (marked `is_core` in DB) is locked/required. The total is a simple sum of all selected module prices.

### New Behavior
The custom builder should work as a **base package (M350) + optional add-ons**:

- **Base Package (M350/mo)** -- Always included, cannot be deselected:
  - Core (CRM + Clients)
  - Quotes
  - Invoices
  - Delivery Notes

- **Add-on Modules** -- Optional, each with its own price added on top of M350:
  - Profitability (M50/mo)
  - Task Management (M30/mo)
  - Tender Tracking (M30/mo)
  - Accounting (M80/mo)
  - Staff and HR (M80/mo)
  - Fleet Management (M100/mo)
  - Workshop Management (M80/mo)
  - School modules, Hire modules, Guesthouse modules, etc.

### UI Layout

The ModuleSelector will be restructured:

1. **Header** -- "Build Your Package" (unchanged)
2. **Base Package Card** -- A single highlighted card showing "BizPro Base" at M350/mo with the 4 included modules listed, marked as "Included"
3. **Add-ons Grid** -- Grid of optional module cards (same style as now) with individual prices, togglable
4. **Summary Bar** -- Shows "Base M350 + X add-ons = Total M\_\_\_/month"

### Technical Changes

**File: `src/components/auth/ModuleSelector.tsx`**

- Define `BASE_PACKAGE_KEYS` = `['core_crm', 'quotes', 'invoices', 'delivery_notes']` and `BASE_PRICE = 350`
- Auto-select base modules and mark them as locked (non-toggleable), similar to current `is_core` logic
- Split the module list into base modules and add-on modules
- Render a dedicated "Base Package" card at the top showing the 4 included modules at M350
- Render the add-ons grid below with individual per-module pricing
- Update the total calculation: `BASE_PRICE + sum of selected add-on prices`
- The summary bar shows the breakdown: "Base M350 + add-ons"

No database changes required -- the base package concept is handled in frontend logic, and the individual module IDs are still passed to `onComplete()` for storage in `user_modules`.
