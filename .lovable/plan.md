

# Add Module Creation to Admin Panel

Currently the Module Management section only allows editing and toggling existing modules. This plan adds the ability to create brand-new modules directly from the Admin Settings panel.

---

## What Changes

### 1. "Add Module" Button and Dialog

Add an "Add New Module" button to the Module Management card header. Clicking it opens a dialog with fields for:

- **Name** -- Display name (e.g., "Inventory Management")
- **Key** -- System key, auto-generated from name (e.g., "inventory_management"), editable
- **Description** -- Short description shown during signup
- **Monthly Price** -- Cost in Maluti
- **Icon** -- Dropdown/input to pick a Lucide icon name (e.g., "Package", "Warehouse")
- **Is Core** -- Toggle for whether this module is required for all users
- **Sort Order** -- Number to control display order

### 2. Delete Module Option

Add a delete button (with confirmation) on each module row, allowing removal of non-core modules that haven't been subscribed to by any users.

---

## Technical Details

### File: `src/components/admin/ModuleManagement.tsx`

- Add state for "add mode" dialog (reuse the edit dialog pattern)
- Add an `insertModule` mutation that calls `supabase.from('platform_modules').insert(...)`
- Add a `deleteModule` mutation with a confirmation step
- Add the "Add Module" button in the card header
- The key field auto-generates from the name (lowercased, spaces replaced with underscores) but remains editable
- Icon field is a text input where the admin types the Lucide icon name

### Important Notes

- New modules will automatically appear in the signup Module Selector, Billing page, and Landing page pricing -- no code changes needed for those
- However, a new module won't have an actual feature page or nav entry until those are built separately -- it will just be a "subscribed" flag
- Navigation entries (Sidebar, BottomNav, MoreMenuSheet) and the actual page/route still need to be added manually per module by asking me to build them
- The admin can pre-create modules, set pricing, and toggle them on/off; the feature pages can be built incrementally

### No Database Changes Required

The `platform_modules` table and its RLS policies already support INSERT and DELETE for super admins, so no migration is needed.

