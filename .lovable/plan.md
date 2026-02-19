
# Consolidate Admin Dashboard Duplication

## The Problem

There are three overlapping "tenant list" views in the admin panel, plus duplicated constant definitions spread across files:

**Redundant tabs / components:**
- `CustomersTab.tsx` — full tenant table with filters, search, eye/settings/delete actions
- `SubscriptionsTab.tsx` (rendered as "Billing" tab) — another full tenant table with its own search/filter, also opens `TenantDetailDialog` and `EditSubscriptionDialog`
- `TenantsTab.tsx` — a third tenant table, not even rendered anywhere in the app

**Duplicated constants (copy-pasted across 3+ files):**
- `statusColors` — defined identically in `TenantsTab`, `SubscriptionsTab`, `CustomersTab`
- `planLabels` — defined in `TenantsTab`, `SubscriptionsTab`, `CustomersTab`, `TenantDetailDialog`
- `systemIcons`, `systemLabels`, `systemColors` — defined in `TenantsTab`, `CustomersTab`, and partially in `TenantDetailDialog`

## The Fix

### 1. Create a shared constants file — `src/components/admin/adminConstants.ts`

Extract all repeated lookup maps into one place:
- `STATUS_COLORS` (subscription status → badge class)
- `PLAN_LABELS` (plan key → display name)
- `SYSTEM_ICONS`, `SYSTEM_LABELS`, `SYSTEM_COLORS` (system type → icon/label/color)

All three tab files and the detail dialog import from here — no more copy-paste.

### 2. Delete `TenantsTab.tsx`

It is not imported anywhere in `Admin.tsx` or `admin/index.ts` and is completely superseded by `CustomersTab`. Remove it.

### 3. Merge "Customers" and "Billing" tabs into one enhanced tab

The two tabs serve different but complementary purposes:
- **Customers** = who has signed up (onboarded + not-onboarded), with delete actions
- **Billing** = subscription plan, price, payment tracker, generate invoice

These can be unified into a single **"Customers"** tab. When you click on a row it opens a detail sheet that already has billing info. The "Generate Invoice" button (currently only in Billing) moves to the row actions on the shared table. The Billing tab is then removed.

The admin nav becomes: `Overview | CRM | Customers | Invoices | Settings` (one less tab, no lost functionality).

### 4. Update `admin/index.ts`

Remove the `BillingTab` export (and `TenantsTab` if it was ever exported).

## Files Changed

| File | Action |
|---|---|
| `src/components/admin/adminConstants.ts` | Create (new shared constants) |
| `src/components/admin/TenantsTab.tsx` | Delete |
| `src/components/admin/SubscriptionsTab.tsx` | Delete (merged into Customers) |
| `src/components/admin/BillingTab.tsx` | Delete (re-export shim no longer needed) |
| `src/components/admin/CustomersTab.tsx` | Enhance: add Price column + Generate Invoice button + import from shared constants |
| `src/components/admin/TenantDetailDialog.tsx` | Refactor: import constants from shared file |
| `src/components/admin/index.ts` | Remove `BillingTab` export |
| `src/pages/Admin.tsx` | Remove "Billing" tab, import only remaining tabs |

## What is preserved

- All functionality: search, filter, detail view, edit subscription, generate invoice, delete, payment tracker
- The "Billing" detail sheet from `SubscriptionsTab` (PaymentTracker + price display) is moved into the existing `CustomersTab` row-click sheet
- No database changes needed
