
# Filter Modules by System Type and Clean Up Data

## Overview

The dashboard currently shows modules from all system types (Business, Workshop, School) because the `platform_modules` table has no `system_type` column, and the module selector during signup shows all modules regardless of the user's chosen system. This fix will add system-type awareness to modules so users only see what belongs to their industry.

## What Changes

### 1. Add `system_type` column to `platform_modules` table

A new column `system_type` will be added to the `platform_modules` table. Each module will be tagged with the system it belongs to. Some modules (like Core CRM, Invoices, Tasks, Staff, Fleet) are shared across systems and will be tagged as `'shared'`.

Module-to-system mapping:

| Module | System Type |
|--------|------------|
| Core CRM | shared |
| Quotes | shared |
| Invoices | shared |
| Delivery Notes | shared |
| Profitability | shared |
| Task Management | shared |
| Accounting | shared |
| Staff & HR | shared |
| Fleet Management | shared |
| Tender Tracking | business |
| Workshop Management | workshop |
| School Admin | school |
| Student Management | school |
| School Fees | school |

### 2. Filter Module Selector during signup

Update `ModuleSelector.tsx` (the "custom build" step) to accept the selected `systemType` prop and filter modules to only show modules that belong to that system type or are shared.

### 3. Filter Billing page module list

Update `Billing.tsx` to only show modules relevant to the user's `systemType` from their subscription, so they cannot toggle on modules from other systems.

### 4. Filter MoreMenuSheet

Fix the `MoreMenuSheet.tsx` fallback behavior -- currently when `userModules.length === 0`, it shows everything (`return true`). Change this to hide gated items instead.

### 5. Clean up existing user data

Remove incorrect module assignments from users who have cross-system modules:
- User `c299b74b` (business) -- has workshop + school modules, needs cleanup
- User `be86cadc` (workshop) -- has school modules, needs cleanup
- User `3628fe41` (school) -- check if they have business-only modules

### 6. Update Admin Module Management

Add the `system_type` indicator in the Admin Module Management panel so admins can see which system each module belongs to.

## Files to Change

| File | Change |
|------|--------|
| Database migration | Add `system_type` column to `platform_modules`, update each module's value |
| `src/components/auth/ModuleSelector.tsx` | Accept `systemType` prop, filter modules by system type |
| `src/pages/Auth.tsx` | Pass `systemType` to `ModuleSelector` |
| `src/pages/Billing.tsx` | Filter `platformModules` to only show modules matching user's system type |
| `src/components/layout/MoreMenuSheet.tsx` | Fix fallback when `userModules.length === 0` to hide gated items |
| `src/hooks/useModules.tsx` | Add `systemType` filtering helper |
| `src/components/admin/ModuleManagement.tsx` | Show system_type badge, allow editing system_type on module create/edit |
| Data cleanup | Remove mismatched user_modules entries |

## Technical Details

### Database Migration

```text
ALTER TABLE platform_modules 
  ADD COLUMN system_type text NOT NULL DEFAULT 'shared';

UPDATE platform_modules SET system_type = 'business' WHERE key = 'tenders';
UPDATE platform_modules SET system_type = 'workshop' WHERE key = 'workshop';
UPDATE platform_modules SET system_type = 'school' WHERE key IN ('school_admin', 'students', 'school_fees');
-- All other modules remain 'shared' (available to all systems)
```

### Filtering Logic

Modules will be shown to a user if:
- `module.system_type = 'shared'` (available to all), OR
- `module.system_type = user's system_type` (industry-specific)

This means a Business user sees shared + business modules, a Workshop user sees shared + workshop modules, and a School user sees shared + school modules.

### Data Cleanup

SQL statements will remove the wrong cross-system modules from existing users' `user_modules` table to immediately fix current dashboards.
