

## Fix: Payslip Not Appearing After Creation

### Problem
The payslip **is** saved to the database successfully. The issue is that two separate components (`PayrollTab` and `GeneratePayslipDialog`) each create their own independent instance of the `usePayslips` hook. When the dialog creates a payslip and calls `fetchPayslips()`, it only refreshes its own internal state -- the `PayrollTab`'s list never gets updated.

### Solution
Pass the `PayrollTab`'s refetch function down to the `GeneratePayslipDialog` so that after a payslip is created, the tab's data is also refreshed.

---

### Technical Details

**File: `src/components/staff/GeneratePayslipDialog.tsx`**
- Remove the separate `usePayslips()` call
- Accept `createPayslip` and `onSuccess` as props instead

**File: `src/components/staff/PayrollTab.tsx`**
- Pass `createPayslip` from its own `usePayslips()` hook to `GeneratePayslipDialog`
- Also pass an `onSuccess` callback that triggers `refetch` after creation

Specifically:
1. In `PayrollTab`, destructure `createPayslip` and `refetch` from `usePayslips()`
2. Pass them to `GeneratePayslipDialog` as props
3. In `GeneratePayslipDialog`, remove `const { createPayslip } = usePayslips()` and use the prop instead
4. After successful creation, call `onSuccess()` which triggers the parent's refetch
