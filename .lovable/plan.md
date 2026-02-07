

# Remove Non-School Modules -- School-Only Platform

## Overview

Transform the platform from a multi-industry SaaS (Business, Workshop, School) into a dedicated **School Management System**. All client/lead, quoting, delivery note, tender, profitability, workshop, and fleet features will be removed. The remaining modules are those relevant to running a school.

## What Stays

| Module | Purpose |
|--------|---------|
| School Admin | Classes, terms, announcements |
| Student Management | Student records, guardian info |
| School Fees | Fee tracking and payments |
| Invoices | Fee invoicing for parents |
| Task Management | Internal tasks for staff |
| Staff & HR | Teacher/staff management |
| Accounting | Financial overview |
| Settings | School profile configuration |
| Billing | Subscription management |

## What Gets Removed

| Module/Feature | Reason |
|----------------|--------|
| CRM (Clients & Leads) | Not needed for schools |
| Quotes | Schools don't quote |
| Delivery Notes | Not applicable |
| Tenders | Business-only feature |
| Profitability | Business analytics |
| Fleet Management | Not school-relevant |
| Workshop (Job Cards) | Auto workshop feature |

## Changes by Area

### 1. Landing Page (school-only branding)

**Hero.tsx** -- Remove the 3-system pills (Business, Workshop, School). Update headline from "One Platform for Every Industry" to school-focused messaging. Remove multi-system references.

**Solutions.tsx** -- Remove Business and Workshop solution cards. Show only the School Management solution, or replace with a features showcase focused on school capabilities.

**PricingTable.tsx** -- Remove Business and Workshop tabs. Show only School pricing tiers directly (no tab switcher needed).

### 2. Signup Flow

**SystemSelector.tsx** -- Skip this step entirely since there's only one system now. Auto-select 'school'.

**PackageTierSelector.tsx** -- Remove Business and Workshop tier configs. Only keep School tiers. Remove "Core CRM & Clients" from the feature lists, replace with school-relevant naming.

**Auth.tsx** -- Skip the system selection step, auto-set `selectedSystem = 'school'`. Go directly to package tier selection.

**ModuleSelector.tsx** -- Filter to only show school and shared modules (already partially works via systemType prop).

### 3. Navigation

**Sidebar.tsx** -- Remove: CRM, Quotes, Delivery Notes, Profitability, Tenders, Fleet, Workshop entries. Keep: Dashboard, Students, School Admin, School Fees, Invoices, Tasks, Staff, Accounting, Settings, Billing.

**BottomNav.tsx** -- Replace CRM and Quotes with school-relevant items (Students, School Fees). Keep Home and More.

**MoreMenuSheet.tsx** -- Remove: Delivery Notes, Tenders, Profitability, Fleet, Workshop entries. Keep: Tasks, Accounting, Staff, School Admin, Students, School Fees, Settings, Billing.

### 4. Dashboard

**Dashboard.tsx** -- Remove BusinessDashboard and WorkshopDashboard. Always render SchoolDashboard. Remove imports for LeadsPipeline, TendersList, TenderSourceLinks.

### 5. Routes

**App.tsx** -- Remove routes: `/crm`, `/quotes`, `/delivery-notes`, `/tenders`, `/profitability`, `/fleet`, `/workshop`. Remove corresponding page imports.

### 6. Database

- Deactivate non-school modules in `platform_modules` (`is_active = false`) for: `core_crm`, `quotes`, `delivery_notes`, `tenders`, `profitability`, `fleet`, `workshop`
- Clean up `user_modules` by deactivating entries referencing these modules
- Keep `invoices`, `tasks`, `accounting`, `staff` as shared modules that schools use

### 7. File Cleanup (not deleting, just disconnecting)

The following page files will have their route entries removed from App.tsx so they become unreachable:
- `src/pages/CRM.tsx`
- `src/pages/Quotes.tsx`
- `src/pages/DeliveryNotes.tsx`
- `src/pages/Tenders.tsx`
- `src/pages/Profitability.tsx`
- `src/pages/Fleet.tsx`
- `src/pages/Workshop.tsx`
- `src/pages/WorkshopDashboard.tsx`

## Technical Details

### Database Migration

```text
-- Deactivate non-school modules
UPDATE platform_modules SET is_active = false 
WHERE key IN ('core_crm', 'quotes', 'delivery_notes', 'tenders', 'profitability', 'fleet', 'workshop');

-- Deactivate user_modules entries for these modules
UPDATE user_modules SET is_active = false 
WHERE module_id IN (
  SELECT id FROM platform_modules 
  WHERE key IN ('core_crm', 'quotes', 'delivery_notes', 'tenders', 'profitability', 'fleet', 'workshop')
);
```

### Auth.tsx Signup Flow Changes

Skip the system selection step. When user enters signup:
- Auto-set `selectedSystem = 'school'`
- Go straight to the package tier step (`signupStep = 'tier'`)
- The tier selector only shows school tiers
- Custom build only shows school + shared modules

### Navigation Restructure

Sidebar navigation reduced to:

```text
Dashboard (always visible)
Students (module: students)
School Admin (module: school_admin)
School Fees (module: school_fees)
Invoices (module: invoices)
Tasks (module: tasks)
Staff (module: staff)
Accounting (module: accounting)
Settings (always visible)
Billing (always visible)
```

Bottom nav items:

```text
Home | Students | School Fees | Invoices | More
```

### Files Modified

| File | Change |
|------|--------|
| Database migration | Deactivate non-school modules |
| `src/App.tsx` | Remove 7 route entries and imports |
| `src/components/landing/Hero.tsx` | School-only branding |
| `src/components/landing/Solutions.tsx` | School-only solution |
| `src/components/landing/PricingTable.tsx` | School-only pricing |
| `src/components/auth/SystemSelector.tsx` | No longer used (skipped) |
| `src/components/auth/PackageTierSelector.tsx` | School tiers only |
| `src/pages/Auth.tsx` | Skip system selection, auto-set school |
| `src/components/layout/Sidebar.tsx` | Remove non-school nav items |
| `src/components/layout/BottomNav.tsx` | School-focused bottom nav |
| `src/components/layout/MoreMenuSheet.tsx` | Remove non-school items |
| `src/pages/Dashboard.tsx` | Always render SchoolDashboard |

