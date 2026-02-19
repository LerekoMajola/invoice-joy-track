

## Add Employee Number to Payslip Document

### What Changes

An employee number field will be added to each staff member's record and displayed on the payslip document alongside the employee name.

---

### Technical Details

**1. Database Migration**
- Add an `employee_number` column (`TEXT`, nullable) to the `staff_members` table

**2. File: `src/hooks/useStaff.tsx`**
- Add `employeeNumber: string | null` to the `StaffMember` interface
- Map `employee_number` from the database in `fetchStaff`
- Add `employeeNumber` to `CreateStaffData`, `UpdateStaffData`, and the create/update functions

**3. File: `src/components/staff/StaffDetailDialog.tsx`**
- Show the employee number field in the detail view
- Add an input for it in the edit form

**4. File: `src/components/staff/AddStaffDialog.tsx`**
- Add an optional "Employee Number" input field

**5. File: `src/hooks/usePayslips.tsx`**
- Include `staffEmployeeNumber` in the `Payslip` interface
- Join `staff_members.employee_number` in the fetch query

**6. File: `src/components/staff/PayslipPreview.tsx`**
- Display the employee number in the "Employee Info" section of the payslip, below the employee name

**7. File: `src/components/staff/GeneratePayslipDialog.tsx`**
- No changes needed (employee number comes from the staff record, not from payslip creation)

