

## Remove Multi-Company for Regular Users; Admin-Only Override

### Overview
By default, users will only be able to manage a single company. The "Add Company" option will be hidden. A new database column `multi_company_enabled` on the `subscriptions` table will let the admin toggle this feature on a per-tenant basis from the Admin dashboard.

### Changes

**1. Database Migration**
- Add a `multi_company_enabled BOOLEAN DEFAULT false` column to the `subscriptions` table.

**2. `src/hooks/useSubscription.tsx`**
- Expose `multiCompanyEnabled: boolean` from the subscription data (reads `multi_company_enabled` from the query result).

**3. `src/contexts/ActiveCompanyContext.tsx`**
- Remove the hardcoded `MAX_COMPANIES = 5` constant.
- Import `useSubscription` or accept a prop to check `multiCompanyEnabled`.
- Set `canAddMore` to `false` unless `multiCompanyEnabled` is `true` (in which case allow up to 5).

**4. `src/components/layout/CompanySwitcher.tsx`**
- When `canAddMore` is `false` and the user has only 1 company, render just the company name/logo as a static display (no dropdown, no "Add Company" option).
- When `canAddMore` is `true`, show the full switcher with the "Add Company" menu item (existing behavior).

**5. Admin Dashboard -- Toggle per tenant**
- In `src/components/admin/TenantDetailDialog.tsx` (or equivalent tenant management UI), add a toggle/switch labeled "Multi-Company Access" that updates the `multi_company_enabled` column on that tenant's subscription.
- This gives admin case-by-case control.

### Technical Details

| Layer | File | Change |
|-------|------|--------|
| DB | Migration | `ALTER TABLE subscriptions ADD COLUMN multi_company_enabled BOOLEAN DEFAULT false` |
| Hook | `useSubscription.tsx` | Expose `multiCompanyEnabled` field |
| Context | `ActiveCompanyContext.tsx` | Use `multiCompanyEnabled` to gate `canAddMore` and `addCompany` |
| UI | `CompanySwitcher.tsx` | Hide add/switch when disabled; show static branding only |
| Admin | `TenantDetailDialog.tsx` | Add toggle to enable/disable per tenant |

