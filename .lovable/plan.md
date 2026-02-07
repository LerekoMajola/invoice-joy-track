

# Staff Module Access Control

Allow tenants to add staff members AND control which modules each staff member can access. For example, one staff member might only get "Invoices + Quotes" while another gets "CRM + Accounting + Staff."

---

## Current State

- Tenants **can already add staff** from the Staff page -- with names, emails, roles (Admin/Manager/Staff/Viewer), and departments
- Staff have roles like Admin, Manager, Staff, Viewer -- but these are generic access levels
- There is **no way** to restrict which modules a specific staff member can see or interact with
- The module system (`platform_modules` + `user_modules`) currently only applies to the tenant (owner), not to individual staff

---

## What This Plan Adds

When a tenant adds or edits a staff member, they will see the list of **their own active modules** and can toggle which ones that staff member has access to. This means:

- A tenant with Invoices, CRM, and Accounting can give Staff Member A access to just Invoices
- Staff Member B could get CRM + Accounting
- Core modules can be optionally included for each staff member (they're only mandatory for the tenant/owner)

---

## Changes

### 1. New Database Table: `staff_module_access`

A junction table linking staff members to specific platform modules:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| staff_member_id | uuid (FK) | Links to staff_members |
| module_id | uuid (FK) | Links to platform_modules |
| is_active | boolean | Whether access is currently enabled |
| created_at | timestamptz | When access was granted |

**RLS Policies:**
- Owners can manage access for their own staff (validated through the `staff_members` table's `owner_user_id`)
- Staff can view their own module access (via `staff_members.user_id`)

### 2. Update Add Staff Dialog (`src/components/staff/AddStaffDialog.tsx`)

Add a **Module Access** section below the existing form fields:
- Show a checklist of the tenant's active modules (fetched via `useModules`)
- Each module shown as a toggle/checkbox with its icon and name
- By default, all of the tenant's active modules are pre-selected
- Tenant can deselect modules to restrict staff access
- On submit, save the selected modules to `staff_module_access`

### 3. Update Staff Detail Dialog (`src/components/staff/StaffDetailDialog.tsx`)

Add a **Module Access** section to the detail view:
- Show which modules this staff member currently has access to (with badges)
- In edit mode, show toggleable switches for each module
- Allow the tenant to update module access for existing staff

### 4. Update `useStaff` Hook (`src/hooks/useStaff.tsx`)

- Add `moduleAccess` field to the `StaffMember` interface (array of module IDs)
- Fetch module access when loading staff members
- Add `updateStaffModuleAccess(staffId, moduleIds)` function
- Update `createStaff` to also save module access

### 5. Create `useStaffModuleAccess` Helper (optional, can be inline)

Simple queries:
- `getStaffModuleAccess(staffId)` -- fetch which modules a staff member has
- `setStaffModuleAccess(staffId, moduleIds)` -- bulk update module access

---

## How It Looks in the UI

**When adding a new staff member:**
The existing form fields (name, email, phone, job title, department, role, notes) remain the same. Below the Role selector, a new "Module Access" section appears showing toggle switches for each of the tenant's active modules.

**When viewing staff details:**
Below the existing details and role selector, a "Module Access" section shows which modules the staff member can access as a list of badges/chips. In edit mode, these become toggleable switches.

---

## Technical Details

### Database Migration

```text
-- New table for staff module access
staff_module_access (
  id uuid PK,
  staff_member_id uuid FK -> staff_members,
  module_id uuid FK -> platform_modules,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
)

-- RLS: Owners manage via staff_members ownership
-- RLS: Staff can read their own access
```

### Files to Create
| File | Purpose |
|------|---------|
| (migration) | Create `staff_module_access` table with RLS |

### Files to Modify
| File | Change |
|------|--------|
| `src/components/staff/AddStaffDialog.tsx` | Add module access toggles section |
| `src/components/staff/StaffDetailDialog.tsx` | Show and edit module access |
| `src/hooks/useStaff.tsx` | Add module access to staff CRUD operations |

### No changes needed to
- Navigation gating (Sidebar/BottomNav) -- this currently gates by tenant modules, which is correct. Staff-level gating would be a future enhancement when staff members can log in as their own users
- The `useModules` hook -- it stays focused on tenant-level modules

