

# Fix System-Type-Aware Dashboard and Navigation

## Problem

Right now, the Dashboard always shows the School Dashboard for every user, regardless of their system type. The navigation sidebar and bottom nav are also hardcoded with school-specific items only. Your business account is seeing "School Dashboard" with students, fees, and school operations -- which is wrong.

## What This Fix Does

Make the entire app system-type-aware so that:
- **Business users** see a Business Dashboard with quotes, invoices, CRM, and tenders
- **Workshop users** see a Workshop Dashboard with job cards and repairs
- **School users** see the School Dashboard (as it currently works)
- Navigation menus adapt to show only relevant items per system type

## Changes

### 1. Dashboard Router (`src/pages/Dashboard.tsx`)

Update to check the user's `system_type` from their subscription and render the correct dashboard:
- `business` -- renders a new Business Dashboard (quotes, invoices, clients overview)
- `workshop` -- renders the existing `WorkshopDashboard`
- `school` -- renders the existing `SchoolDashboard`

### 2. New Business Dashboard (`src/pages/BusinessDashboard.tsx`)

Create a dedicated Business Dashboard with:
- Stat cards: Total Clients, Quotes This Month, Revenue This Month, Pending Invoices
- Quick actions: Create Quote, Create Invoice, Add Client
- Recent activity / pipeline overview
- Uses existing hooks (`useClients`, `useQuotes`, `useInvoices`)

### 3. System-Aware Navigation

Update Sidebar, BottomNav, and MoreMenuSheet to show different nav items based on the user's `system_type`:

**Business navigation:**
- Dashboard, Clients, CRM, Quotes, Invoices, Tenders, Delivery Notes, Tasks, Staff, Accounting, Settings, Billing

**Workshop navigation:**
- Dashboard, Workshop, Quotes, Invoices, Tasks, Staff, Accounting, Settings, Billing

**School navigation (current):**
- Dashboard, Students, School Admin, School Fees, Timetable, Invoices, Tasks, Staff, Accounting, Settings, Billing

Each nav item will have a `systemTypes` property indicating which system(s) it belongs to, in addition to the existing `moduleKey` gating.

### 4. Re-enable Routes (`src/App.tsx`)

Add back the missing routes that were removed during the school pivot:
- `/clients` -- Clients page
- `/crm` -- CRM page
- `/quotes` -- Quotes page
- `/tenders` -- Tenders page
- `/delivery-notes` -- Delivery Notes page
- `/workshop` -- Workshop page
- `/profitability` -- Profitability page

### 5. Re-activate Platform Modules (Database)

Re-enable the deactivated business and workshop modules so users on those systems can access them:
- `core_crm` (CRM + Clients)
- `quotes` (Quotes)
- `delivery_notes` (Delivery Notes)
- `tenders` (Tender Tracking)
- `workshop` (Workshop Management)
- `profitability` (Profitability)

The `fleet` module will remain deactivated unless requested.

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Dashboard.tsx` | Modify | Route to correct dashboard based on system_type |
| `src/pages/BusinessDashboard.tsx` | Create | New business-focused dashboard |
| `src/components/layout/Sidebar.tsx` | Modify | Add all system nav items with system_type filtering |
| `src/components/layout/BottomNav.tsx` | Modify | System-aware bottom nav items |
| `src/components/layout/MoreMenuSheet.tsx` | Modify | System-aware more menu items |
| `src/App.tsx` | Modify | Re-add missing routes for business/workshop pages |
| Database migration | Execute | Re-enable deactivated modules |

## How System Filtering Works

Each navigation item will have a structure like:

```text
{
  name: 'Clients',
  href: '/clients',
  icon: Users,
  moduleKey: 'core_crm',
  systemTypes: ['business']    // only shown for business users
}
```

Items with `systemTypes: null` (like Dashboard, Settings, Billing) show for everyone. The filtering logic combines both checks: the item must match the user's system type AND the user must have the module active.

## Technical Details

- The `useSubscription` hook already provides `systemType` -- we just need to consume it in the navigation and dashboard components
- Business and Workshop dashboard pages already exist or will reuse existing hooks
- No schema changes needed beyond re-activating modules
- All routes remain protected behind `ProtectedRoute`

