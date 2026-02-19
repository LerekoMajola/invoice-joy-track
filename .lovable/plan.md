
# Restore Billing Tab — Paying Customers Only

## What Happened

The consolidation merged the Billing tab into the Customers tab (accessible via the billing sheet icon per row). But you want a dedicated Billing tab focused purely on revenue-relevant accounts — companies that are past the trial stage.

## The Fix

### 1. Create `src/components/admin/BillingTab.tsx`

A new, focused billing view that:
- **Filters to non-trialing tenants only**: `status` is `active`, `past_due`, `cancelled`, or `expired` — never `trialing`
- Shows a summary header: total active count, total MRR (monthly recurring revenue)
- Table columns: Company, System, Status, Plan, Price/mo, Trial Ended, Actions
- Row actions: open the billing sheet (PaymentTracker + Generate Invoice) and Edit Subscription
- Reuses the same billing sheet already built in CustomersTab (extract it to a shared component or duplicate minimally)

### 2. Add "Billing" tab to `Admin.tsx`

Insert between Customers and Invoices:
```
Overview | CRM | Customers | Billing | Invoices | Settings
```

### 3. Export from `admin/index.ts`

Add `BillingTab` to the barrel export.

## What the Billing Tab Shows

| Column | Source |
|---|---|
| Company | `tenant.company_name` |
| System | `tenant.subscription.system_type` |
| Status | `active` / `past_due` / `cancelled` / `expired` (never `trialing`) |
| Plan | `PLAN_LABELS[plan]` |
| Price/mo | `formatMaluti(module_total)` |
| Trial Ended | `trial_ends_at` formatted date |
| Actions | 💳 Billing sheet, ✏️ Edit subscription |

## Summary Stats Bar (top of tab)

```
[ Paying: 3 ]  [ Past Due: 1 ]  [ MRR: M1,350/mo ]
```

Calculated from the filtered list — gives quick financial health at a glance.

## Technical Notes

- Data comes from `useAdminTenants()` already loaded — no new query needed
- Filter: `tenant.subscription?.status !== 'trialing'` AND subscription exists
- The billing sheet (PaymentTracker) and GenerateAdminInvoiceDialog are already built — just wired in
- No database changes required
- The Customers tab remains unchanged — it still shows all customers including trialing ones
