

# Fix: Include Staff Module in All Workshop Tiers

## The Problem

The Workshop Starter tier lists these modules: `core_crm, workshop, quotes, invoices, tasks, delivery_notes` -- but **not** `staff`. However, the job card creation form requires selecting a technician from your staff list. Without the Staff module, workshop users on the Starter plan:

- Cannot see the Staff page in their sidebar
- Cannot add technicians
- Cannot assign anyone to job cards

Staff is a **dependency** for the Workshop module, not an optional add-on.

## The Fix

### 1. Add `staff` to Workshop Starter tier

Update `src/components/auth/PackageTierSelector.tsx` to include `'staff'` in the Workshop Starter `moduleKeys` array, and mark "Staff & HR" as included in the features list.

Before:
- moduleKeys: `['core_crm', 'workshop', 'quotes', 'invoices', 'tasks', 'delivery_notes']`
- "Staff & HR" shown as not included

After:
- moduleKeys: `['core_crm', 'workshop', 'quotes', 'invoices', 'tasks', 'delivery_notes', 'staff']`
- "Staff & HR" shown as included

The Professional and Enterprise tiers already include `staff`, so no changes needed there.

### 2. Fix current workshop user's modules

Run a one-time data fix to add the `staff` module to the existing workshop user (`be86cadc-9e1f-46e9-937b-de74186e4237`) so they don't have to re-register.

### 3. Add technician text fallback in CreateJobCardDialog

Even with Staff included, a brand new user may not have added their technicians yet. Update `src/components/workshop/CreateJobCardDialog.tsx` to:
- Show a text input if no staff members exist (so they can still type a name and create the job card)
- Add a small "+ Add staff member" link that opens the AddStaffDialog inline
- Automatically refresh the dropdown when a new staff member is added

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/auth/PackageTierSelector.tsx` | Add `'staff'` to Workshop Starter moduleKeys; mark "Staff & HR" as `included: true` |
| `src/components/workshop/CreateJobCardDialog.tsx` | Add text input fallback for technician name when no staff exist; add inline "Add Staff" option |
| Database (one-time fix) | Insert `staff` module for existing workshop user |

## Technical Details

### PackageTierSelector change (line 95-96)

```
// Before
moduleKeys: ['core_crm', 'workshop', 'quotes', 'invoices', 'tasks', 'delivery_notes'],
// ...
{ name: 'Staff & HR', included: false },

// After
moduleKeys: ['core_crm', 'workshop', 'quotes', 'invoices', 'tasks', 'delivery_notes', 'staff'],
// ...
{ name: 'Staff & HR', included: true },
```

### CreateJobCardDialog technician section

The technician field will work in two modes:

**Mode A -- No staff members yet:**
- Text input: "Enter technician name" 
- Small link below: "+ Add to your team" (opens AddStaffDialog)

**Mode B -- Staff members exist:**
- Dropdown to select from staff list (current behavior)
- Small link below: "+ Add to your team" (for convenience)

When a staff member is added via the inline dialog, the `useStaff` hook's `refetch` function is called, and the dropdown automatically shows the new person.

### Database fix

Add the missing `staff` module to the workshop user:
```sql
INSERT INTO user_modules (user_id, module_id)
SELECT 'be86cadc-9e1f-46e9-937b-de74186e4237', id 
FROM platform_modules WHERE key = 'staff';
```

