
## Three Changes to Staff Management

### 1. Remove "Draft" from Payslips -- Create as Final Documents
Payslips are actual documents meant for download and sending. The current "draft" workflow adds unnecessary friction.

**Changes:**
- **`src/hooks/usePayslips.tsx`**: Change default status from `'draft'` to `'approved'` when creating a payslip. Remove the `approvePayslip` function.
- **`src/components/staff/PayrollTab.tsx`**: Remove the "Draft" stat card and replace with something more useful (e.g. "This Month"). Remove the "Approve" menu item. Update the status filter to remove "Draft". Keep "Mark as Paid" as the only status transition.
- **`src/components/staff/PayslipPreview.tsx`**: Remove `'draft'` from status color handling.

### 2. Auto-Generate Employee Number
When adding a new staff member, the employee number will be automatically generated in the format `EMP001`, `EMP002`, etc., based on the highest existing number.

**Changes:**
- **`src/hooks/useStaff.tsx`**: Add a helper function `generateEmployeeNumber` that queries the database for the highest existing employee number matching the `EMP###` pattern and increments it. Call this in `createStaff` when no manual employee number is provided.
- **`src/components/staff/AddStaffDialog.tsx`**: Change the employee number field to show "Auto-generated" as placeholder text and make it read-only (or show "Will be auto-assigned: EMP00X"). Remove the manual input -- the number is always auto-assigned.

### 3. Custom Roles (Free-text instead of fixed enum)
Different companies use different role names. The fixed `admin/manager/staff/viewer` enum will be replaced with a free-text role field plus the ability to create custom roles.

**Changes:**
- **Database migration**: 
  - Change the `staff_roles.role` column from `staff_role` enum to `TEXT`
  - Keep backward compatibility with existing data
- **`src/hooks/useStaff.tsx`**: Change `StaffRole` from a union type to `string`. Update role handling.
- **`src/components/staff/AddStaffDialog.tsx`**: Replace the fixed role `Select` dropdown with a combobox-style input that shows existing roles as suggestions plus a free-text "Create custom role" option.
- **`src/components/staff/StaffDetailDialog.tsx`**: Same change for the role selector in the detail view -- show existing roles as suggestions plus allow typing a custom role.

---

### Technical Details

**Database Migration:**
```sql
-- Change staff_roles.role from enum to text
ALTER TABLE public.staff_roles ALTER COLUMN role TYPE TEXT USING role::TEXT;
-- Drop the old enum type (if not used elsewhere)
DROP TYPE IF EXISTS public.staff_role;
```

**Auto Employee Number Logic (`useStaff.tsx`):**
```typescript
const generateEmployeeNumber = async (): Promise<string> => {
  const { data } = await supabase
    .from('staff_members')
    .select('employee_number')
    .eq('owner_user_id', user.id)
    .not('employee_number', 'is', null)
    .order('employee_number', { ascending: false });
  
  // Find highest EMP### number and increment
  let maxNum = 0;
  (data || []).forEach(s => {
    const match = s.employee_number?.match(/^EMP(\d+)$/);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
  });
  return `EMP${String(maxNum + 1).padStart(3, '0')}`;
};
```

**Custom Role UI:** The role selector will show previously used roles from existing staff as quick-select options, plus a text input to type a new custom role name. This way common roles are reusable but companies aren't limited.

**Files modified:**
1. Database migration (new)
2. `src/hooks/useStaff.tsx`
3. `src/hooks/usePayslips.tsx`
4. `src/components/staff/AddStaffDialog.tsx`
5. `src/components/staff/StaffDetailDialog.tsx`
6. `src/components/staff/PayrollTab.tsx`
7. `src/components/staff/PayslipPreview.tsx`
