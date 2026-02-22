

## Fix Custom Package Builder for LawPro (and All Verticals)

### Problems Found

1. **Irrelevant modules showing in custom builder** -- When a LawPro user clicks "Build your own custom package", they see shared modules like "Delivery Notes", "Profitability", and "Fleet Management" that don't apply to law firms. This makes the builder feel broken or confusing.

2. **No review step for custom builds** -- When selecting a pre-built tier (Starter/Professional/Enterprise), users see a review screen before creating their account. But custom builds skip this and go straight to the credentials form. This inconsistency may make users feel something went wrong.

### Changes

**1. Filter modules per vertical relevance**

Update `ModuleSelector.tsx` to only show modules that are relevant to the selected system type. Each vertical will have a curated list of allowed shared modules:

- **Legal**: Core CRM, Invoices, Tasks, Accounting, Staff + all legal-specific modules. Exclude: Quotes, Delivery Notes, Profitability, Fleet, Tenders.
- Other verticals get similar curated lists.

This is done by adding a mapping of which shared modules each system type can access.

**2. Add review step for custom builds**

Update `Auth.tsx` so custom builds also pass through the review step before credentials:
- After selecting modules in the custom builder, set `selectedTier` to "Custom" and go to the review step
- The review step already handles showing the selected modules

### Files to Modify

| File | Change |
|------|--------|
| `src/components/auth/ModuleSelector.tsx` | Add a `SYSTEM_ALLOWED_SHARED_KEYS` mapping to filter out irrelevant shared modules per vertical |
| `src/pages/Auth.tsx` | Update `handleModulesComplete` to set `selectedTier` to "Custom" and go to the review step instead of skipping to credentials |

### Technical Details

**Module filtering logic in `ModuleSelector.tsx`:**

```text
SYSTEM_ALLOWED_SHARED_KEYS = {
  legal:      ['core_crm', 'invoices', 'tasks', 'accounting', 'staff'],
  business:   ['core_crm', 'quotes', 'invoices', 'delivery_notes', 'profitability', 'tasks', 'accounting', 'staff', 'fleet', 'tenders'],
  workshop:   ['core_crm', 'quotes', 'invoices', 'tasks', 'accounting', 'staff'],
  school:     ['core_crm', 'invoices', 'tasks', 'accounting', 'staff'],
  hire:       ['core_crm', 'quotes', 'invoices', 'tasks', 'accounting', 'staff'],
  guesthouse: ['core_crm', 'invoices', 'tasks', 'accounting', 'staff'],
  fleet:      ['core_crm', 'invoices', 'tasks', 'accounting', 'staff', 'fleet'],
  gym:        ['core_crm', 'invoices', 'tasks', 'accounting', 'staff'],
}
```

After fetching modules, filter: show the vertical's own modules + only the allowed shared modules for that vertical.

**Auth.tsx custom flow fix:**

In `handleModulesComplete`, after looking up module keys:
- Set `selectedTier` to `"Custom"`
- Set `selectedTierId` to `null`
- Set `signupStep` to `"review"` instead of `"credentials"`

This gives users the same review screen as pre-built tiers, showing their selected modules before account creation.

