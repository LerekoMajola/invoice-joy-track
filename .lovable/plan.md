

# Read-Only Tenant Business Insights for Admin

## Overview
Add a "Business Insights" section to the Tenant Detail panel that lets you view a tenant's clients, invoices, quotes, and key metrics in read-only mode. This helps you advise tenants on growth and improve the platform based on real usage patterns.

## What You Will See

When you open a tenant's detail panel, there will be new expandable sections showing:

- **Clients** -- list of their clients with contact info and revenue
- **Recent Invoices** -- their latest invoices with status, amounts, and dates
- **Recent Quotes** -- their latest quotes with status and values
- **Business Summary** -- total revenue, average invoice value, conversion rates

All data is read-only with no edit or delete actions.

## How It Works

A secure backend function fetches tenant data using elevated permissions, but only when requested by a verified super admin. The admin role is checked server-side before any data is returned.

---

## Technical Details

### 1. New Backend Function: `admin-get-tenant-data`

File: `supabase/functions/admin-get-tenant-data/index.ts`

- Accepts `{ tenant_user_id: string }` via POST
- Verifies the calling user has the `super_admin` role (server-side check using service role key)
- Uses service role to bypass RLS and fetch the tenant's:
  - Clients (last 50, ordered by revenue)
  - Invoices (last 50, ordered by date)
  - Quotes (last 50, ordered by date)
  - Summary stats (totals, averages)
- Returns all data as a read-only payload
- Strips sensitive fields (bank details, passwords) from the response

### 2. New Hook: `src/hooks/useAdminTenantData.tsx`

- Calls the `admin-get-tenant-data` edge function
- Takes `tenant_user_id` as parameter
- Returns `{ clients, invoices, quotes, summary }` with loading/error states
- Only enabled when a tenant is selected for viewing

### 3. New Component: `src/components/admin/TenantBusinessInsights.tsx`

- Accordion-style sections for Clients, Invoices, Quotes
- Each section shows a compact read-only table
- Business Summary card at the top with key metrics:
  - Total clients, total revenue, active invoices, quote conversion rate
- No edit/delete buttons anywhere -- purely read-only

### 4. Modified: `src/components/admin/TenantDetailDialog.tsx`

- Add the `TenantBusinessInsights` component below the existing Modules section
- Passes the tenant's `user_id` to the insights component
- Wrapped in a collapsible section labeled "Business Insights"

### Files to Create
- `supabase/functions/admin-get-tenant-data/index.ts`
- `src/hooks/useAdminTenantData.tsx`
- `src/components/admin/TenantBusinessInsights.tsx`

### Files to Modify
- `src/components/admin/TenantDetailDialog.tsx` -- add insights section

### Security
- Admin role verified server-side before any data is returned
- Service role key used only in the backend function (never exposed to the client)
- No write operations -- strictly SELECT queries
- Sensitive financial fields (bank account numbers, etc.) are excluded from the response

