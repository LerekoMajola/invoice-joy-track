

# Add Tenant Module Management to Admin Panel

## Overview
Add the ability for super admins to view and toggle which modules are active for any tenant, directly from the Tenants tab in the admin panel.

## How It Will Work
When you click the "eye" icon to view a tenant's details, the detail dialog will include a new "Modules" section showing all available modules for that tenant's system type. You can toggle each module on/off with a switch. Changes save immediately.

## Technical Changes

### 1. Database: Add missing RLS policies on `user_modules`

Currently, super admins can SELECT and UPDATE user_modules but cannot INSERT or DELETE them. Two new policies are needed:

- **"Admins can insert user modules"** -- allows super_admin to INSERT rows for any user
- **"Admins can delete user modules"** -- allows super_admin to DELETE rows for any user

### 2. New Component: `src/components/admin/TenantModuleManager.tsx`

A component that:
- Accepts a tenant's `user_id` and `system_type`
- Fetches all platform modules (filtered by system type + shared)
- Fetches the tenant's current `user_modules` entries
- Displays each module as a row with a toggle switch (on = subscribed, off = not)
- On toggle ON: inserts a `user_modules` row for that tenant
- On toggle OFF: deletes the `user_modules` row for that tenant
- Shows the module name, description, and monthly price

### 3. Modified File: `src/components/admin/TenantDetailDialog.tsx`

- Import and embed the new `TenantModuleManager` component
- Add a "Modules" section below the existing Usage section
- Pass `tenant.user_id` and `tenant.subscription.system_type` to the component

### 4. Modified File: `src/hooks/useAdminTenants.tsx`

No changes needed -- the `user_id` and `system_type` are already available on the tenant object.

## Result
From the Admin panel Tenants tab, clicking the eye icon on any tenant will show their details including a full list of modules with toggles to enable/disable each one instantly.
