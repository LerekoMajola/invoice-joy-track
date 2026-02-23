

## Add Import CSV to the CRM Page

### Problem
The "Import CSV" button lives inside `LeadsTab`, which is not rendered on the CRM page. The CRM page has Pipeline, Deals, Clients, and Forecast tabs -- no Leads tab.

### Solution
Add the Import CSV button directly to the CRM page header area so it's accessible from any tab. This makes sense because importing leads is a top-level action, not tied to a specific tab.

### Changes

**File: `src/pages/CRM.tsx`**

- Import `ImportLeadsDialog` and the `Upload` icon
- Add `importDialogOpen` state
- Add an "Import CSV" button in the header area (next to the "New Deal" action, or as a secondary button below the header)
- Render the `ImportLeadsDialog` component alongside the other dialogs

The header will show two actions:
- "Import CSV" (outline button with Upload icon)
- "New Deal" (primary button, already exists)

### Files Changed

| File | Change |
|------|--------|
| `src/pages/CRM.tsx` | Add Import CSV button and ImportLeadsDialog |

