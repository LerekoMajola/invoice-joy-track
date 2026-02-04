

# Staff Tools Expansion: Profiles, Payslips & HR Features

## Overview
Expand the Staff module with comprehensive HR tools including detailed staff profiles, payslip management, leave tracking, and document management. This transforms the basic staff list into a full HR management system for SMEs.

---

## Feature Summary

| Feature | Description |
|---------|-------------|
| **Staff Profiles** | Extended profile with personal details, emergency contacts, employment info, photo |
| **Payslips** | Generate and manage monthly payslips with salary, deductions, allowances |
| **Leave Management** | Track leave balances, requests, and history |
| **Staff Documents** | Store contracts, IDs, certificates per staff member |
| **Employment History** | Track job title changes, salary adjustments, promotions |

---

## Database Schema

### 1. Extend `staff_members` Table
Add new columns for extended profile information:

```sql
ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS
  -- Personal Details
  date_of_birth DATE,
  gender TEXT,
  national_id TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Lesotho',
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Employment Details
  hire_date DATE,
  contract_type TEXT DEFAULT 'permanent', -- permanent, contract, part-time
  work_schedule TEXT DEFAULT 'full-time', -- full-time, part-time, flexible
  probation_end_date DATE,
  
  -- Compensation
  salary_amount NUMERIC DEFAULT 0,
  salary_currency TEXT DEFAULT 'LSL',
  salary_frequency TEXT DEFAULT 'monthly', -- monthly, bi-weekly, weekly
  bank_name TEXT,
  bank_account_number TEXT,
  bank_branch_code TEXT,
  
  -- Profile
  avatar_url TEXT,
  bio TEXT;
```

### 2. New `payslips` Table

```sql
CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  
  -- Period
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  payment_date DATE NOT NULL,
  
  -- Earnings
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  overtime_rate NUMERIC DEFAULT 0,
  overtime_amount NUMERIC DEFAULT 0,
  
  -- Allowances (JSONB for flexibility)
  allowances JSONB DEFAULT '[]', -- [{name: "Transport", amount: 500}, ...]
  total_allowances NUMERIC DEFAULT 0,
  
  -- Deductions (JSONB for flexibility)
  deductions JSONB DEFAULT '[]', -- [{name: "Tax", amount: 200}, ...]
  total_deductions NUMERIC DEFAULT 0,
  
  -- Totals
  gross_pay NUMERIC NOT NULL DEFAULT 0,
  net_pay NUMERIC NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- draft, approved, paid
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policy
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage payslips"
  ON payslips FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Staff can view own payslips"
  ON payslips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_members sm
      WHERE sm.id = payslips.staff_member_id
        AND sm.user_id = auth.uid()
    )
  );
```

### 3. New `staff_leave` Table

```sql
CREATE TABLE public.staff_leave (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  
  leave_type TEXT NOT NULL, -- annual, sick, family, unpaid, other
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count NUMERIC NOT NULL,
  
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS similar to payslips
```

### 4. New `staff_documents` Table

```sql
CREATE TABLE public.staff_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL, -- contract, id_copy, certificate, other
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  expiry_date DATE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## New Storage Bucket

Create a `staff-assets` bucket for:
- Staff photos/avatars
- Payslip PDFs
- Staff documents (contracts, IDs, certificates)

---

## UI Components

### 1. Enhanced Staff Page with Tabs

Transform Staff.tsx to use tabs:

```text
/staff
  ├── Overview Tab (existing list)
  ├── Payroll Tab
  │   ├── Generate Payslips button
  │   ├── Payslip list with filters (month, status)
  │   └── Bulk actions (approve, mark paid)
  └── Leave Tab (future enhancement)
```

### 2. Staff Profile Page/Dialog

Enhanced StaffDetailDialog with sections:
- **Personal Info**: Photo, DOB, gender, national ID, address
- **Employment**: Hire date, contract type, work schedule, probation
- **Compensation**: Salary, bank details
- **Emergency Contact**: Name, phone, relationship
- **Documents**: Upload/view contracts, IDs, certificates
- **Payslips**: View payslip history
- **Leave**: View leave balance and history

### 3. Payslip Components

| Component | Purpose |
|-----------|---------|
| `PayrollTab.tsx` | Main payroll management tab |
| `GeneratePayslipDialog.tsx` | Form to create payslips for period |
| `PayslipPreview.tsx` | PDF-ready payslip view |
| `PayslipList.tsx` | List/table of payslips |
| `BulkPayslipGenerator.tsx` | Generate payslips for all active staff |

### 4. Leave Components (Phase 2)

| Component | Purpose |
|-----------|---------|
| `LeaveTab.tsx` | Leave management overview |
| `LeaveRequestDialog.tsx` | Submit leave request |
| `LeaveApprovalDialog.tsx` | Approve/reject requests |
| `LeaveBalanceCard.tsx` | Show remaining leave days |

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useStaffProfile.tsx` | Extended profile CRUD |
| `src/hooks/usePayslips.tsx` | Payslip management |
| `src/hooks/useStaffLeave.tsx` | Leave tracking |
| `src/hooks/useStaffDocuments.tsx` | Document management |
| `src/components/staff/StaffProfileTab.tsx` | Full profile view/edit |
| `src/components/staff/PayrollTab.tsx` | Payroll management |
| `src/components/staff/GeneratePayslipDialog.tsx` | Create payslip form |
| `src/components/staff/PayslipPreview.tsx` | Payslip document view |
| `src/components/staff/StaffDocuments.tsx` | Document upload/list |
| `src/components/staff/EmergencyContactCard.tsx` | Emergency info card |
| `src/components/staff/CompensationCard.tsx` | Salary/bank info card |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Staff.tsx` | Add tabs structure (Overview, Payroll) |
| `src/components/staff/StaffDetailDialog.tsx` | Expand with tabs for profile sections |
| `src/hooks/useStaff.tsx` | Add extended profile fields |
| `src/components/staff/index.ts` | Export new components |

---

## Payslip Generation Flow

```text
1. Select Pay Period (month/custom dates)
         ↓
2. Select Staff (all active or specific)
         ↓
3. Auto-populate:
   - Basic salary from staff profile
   - Standard allowances
   - Standard deductions
         ↓
4. Review & Adjust each payslip
         ↓
5. Save as Draft
         ↓
6. Approve → Generate PDF
         ↓
7. Mark as Paid (with payment date)
```

---

## Payslip Template

Standard payslip layout with company branding:

```text
+------------------------------------------+
| [Company Logo]   PAYSLIP                 |
| Company Name                             |
| Period: 01 Feb - 28 Feb 2026             |
+------------------------------------------+
| Employee: John Doe                       |
| ID: EMP-001                              |
| Department: Operations                   |
+------------------------------------------+
| EARNINGS                                 |
| Basic Salary         M 8,000.00          |
| Overtime (10 hrs)    M   500.00          |
| Transport Allowance  M   600.00          |
| Housing Allowance    M 1,000.00          |
|                    ----------------       |
| Gross Pay            M 10,100.00         |
+------------------------------------------+
| DEDUCTIONS                               |
| PAYE Tax            M 1,200.00           |
| Pension (5%)        M   400.00           |
| Medical Aid         M   300.00           |
|                    ----------------       |
| Total Deductions    M 1,900.00           |
+------------------------------------------+
| NET PAY             M 8,200.00           |
+------------------------------------------+
| Payment Method: Bank Transfer            |
| Bank: Standard Lesotho Bank              |
| Account: ****4567                        |
+------------------------------------------+
```

---

## Technical Details

### Profile Photo Upload
Use existing `company-assets` bucket pattern:
- Accept image files (jpg, png)
- Resize to max 400x400
- Store in `staff-avatars/{staff_id}/photo.jpg`

### Payslip PDF Generation
Use existing html2pdf.js pattern (same as invoices):
- Generate HTML template
- Convert to PDF for download

### Currency Handling
Use existing `formatMaluti()` from `src/lib/currency.ts` for displaying amounts.

---

## Security Considerations

1. **RLS on All New Tables**: Owners manage, staff can only view their own records
2. **Sensitive Data**: Bank details and salary information protected by RLS
3. **Document Access**: Staff documents stored in private bucket paths
4. **Audit Trail**: Track who approved payslips and leave requests

---

## Implementation Phases

### Phase 1 (This Plan)
- Extended staff profile fields
- Staff photo upload
- Compensation and bank details
- Emergency contacts
- Basic payslip generation and management

### Phase 2 (Future)
- Leave management
- Staff documents storage
- Employment history tracking
- Performance reviews

---

## Summary

| Category | Count |
|----------|-------|
| New database tables | 3 (payslips, staff_leave, staff_documents) |
| Schema alterations | 1 (staff_members extended) |
| New hooks | 4 |
| New components | 10+ |
| Modified files | 4 |
| Storage bucket | 1 (staff-assets) |

This implementation transforms the Staff module into a comprehensive HR management tool, following existing patterns in the codebase for consistency and maintainability.

