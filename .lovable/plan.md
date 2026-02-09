
# Comprehensive Accounting Module Build

## Overview
The accounting module already has a working foundation (Overview, Expenses, Bank Accounts, Reports). This plan enhances it to cover all 5 pillars you described: Bookkeeping, Financial Statements, Tax Preparation, Expense Categorisation, and Payroll integration.

## What Already Exists
- **Expenses tab**: Full CRUD with categories, vendors, payment methods, and status tracking
- **Bank Accounts tab**: Add/edit/delete accounts with balance tracking
- **Overview tab**: Stat cards (Revenue, Expenses, Payroll, Net Cash Flow, Cash on Hand, Outstanding) plus Cash Flow and Expense Category charts
- **Reports tab**: Income Statement, Expense Report, and Cash Flow Statement with date range filtering
- **Database**: `accounting_transactions` table exists but is completely unused in the frontend
- **Payroll**: Payslips already exist in a separate Staff module with draft/approved/paid workflow

## What Will Be Built

### 1. Bookkeeping -- Transaction Ledger (the foundation)
A new **Transactions tab** that serves as the central ledger, recording every Maluti in and out.

- **New hook** (`useAccountingTransactions`): CRUD for the `accounting_transactions` table with filtering by date, type, bank account, and reconciliation status
- **New component** (`TransactionsTab`): 
  - Summary row: Total Inflows | Total Outflows | Net for the selected period
  - Filter bar: date range, bank account dropdown, type (income/expense/transfer), reconciled/unreconciled, search
  - Sortable table: Date, Description, Type (badge), Bank Account, Reference, Amount (green for income, red for expense), Reconciled status
  - "Add Transaction" button
- **New component** (`AddTransactionDialog`):
  - Fields: Date, Amount, Type (Income/Expense/Transfer), Bank Account, Description, Reference Type (invoice/expense/payroll/manual), Reference Number
  - When saved, automatically adjusts the linked bank account's `current_balance`
- **Reconciliation features**:
  - Toggle reconciled status per row
  - Bulk "Mark as Reconciled" action via checkboxes
  - Visual checkmark badge for reconciled entries
  - Filter to show only unreconciled transactions

### 2. Financial Statements -- Enhanced Reports
Upgrade the existing Reports tab with a proper **Balance Sheet** alongside the already-built Income Statement and Cash Flow.

- **New report**: Balance Sheet
  - Assets: Cash on Hand (sum of all bank account balances), Accounts Receivable (outstanding invoices)
  - Liabilities: Accounts Payable (pending expenses)
  - Equity: Net Assets (Assets minus Liabilities)
- **Improved Income Statement**: Already exists, will ensure it pulls from the transaction ledger for accuracy
- **Improved Cash Flow**: Already exists, will cross-reference with actual transaction records
- Add a **"Balance Sheet"** button to the report selector

### 3. Tax Preparation -- VAT Report
Add a **VAT Report** to the Reports tab that helps with tax compliance.

- **New report**: VAT Report
  - Output VAT: VAT collected on invoices (total x tax rate / (100 + tax rate))
  - Input VAT: VAT paid on expenses (where applicable)
  - Net VAT payable/refundable
  - Summary by month within the selected period
  - Uses the company's default tax rate from `company_profiles`
- This gives accountants and tax authorities the data they need for filing

### 4. Expense Categorisation -- Already Built, Small Enhancements
The expense categorisation system is already robust. Small additions:

- **Category management**: Add ability to create custom categories directly from the Expenses tab (currently the dialog exists in the hook but no UI button)
- **Add Category dialog**: Simple form with name, icon picker, and colour
- Show category colour dots in the expense table for quick visual scanning

### 5. Payroll Integration
Connect the existing payroll (Staff module) to accounting automatically.

- When a payslip is marked as **"paid"**, automatically create an `accounting_transaction` of type `expense` with `reference_type: 'payroll'` and `reference_id` pointing to the payslip
- This makes payroll costs visible in the transaction ledger without manual double-entry
- Update `usePayslips` hook's `markAsPaid` function to insert the transaction

### 6. Auto-Recording from Other Modules
- **Invoices**: When an invoice status changes to "paid", create an `accounting_transaction` of type `income` with `reference_type: 'invoice'`
- **Expenses**: When an expense status changes to "paid", create an `accounting_transaction` of type `expense` with `reference_type: 'expense'`
- These automations eliminate manual bookkeeping for existing workflows

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useAccountingTransactions.tsx` | Hook for transaction CRUD, filtering, balance updates |
| `src/components/accounting/TransactionsTab.tsx` | Transaction ledger list view with filters |
| `src/components/accounting/AddTransactionDialog.tsx` | Create/edit transaction form |
| `src/components/accounting/BalanceSheet.tsx` | Balance Sheet report component |
| `src/components/accounting/VATReport.tsx` | VAT/tax report component |
| `src/components/accounting/AddCategoryDialog.tsx` | Custom expense category creation form |

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/Accounting.tsx` | Add "Transactions" as a 5th tab |
| `src/components/accounting/index.ts` | Export new components |
| `src/components/accounting/ReportsTab.tsx` | Add Balance Sheet and VAT Report buttons/views |
| `src/components/accounting/ExpensesTab.tsx` | Add "New Category" button, category colour dots |
| `src/hooks/useExpenses.tsx` | Auto-create accounting transaction when expense status becomes "paid" |
| `src/hooks/usePayslips.tsx` | Auto-create accounting transaction when payslip is marked as paid |
| `src/hooks/useInvoices.tsx` | Auto-create accounting transaction when invoice is marked as paid |

### Database
No schema changes needed. The `accounting_transactions` table already exists with all required columns (id, user_id, bank_account_id, transaction_type, reference_type, reference_id, date, amount, running_balance, description, is_reconciled, reconciled_at). RLS policies are already correctly configured for user-scoped access.

### Data Flow
```text
  Invoices (paid)  ──┐
  Expenses (paid)  ──┼──> accounting_transactions ──> Reports
  Payslips (paid)  ──┘         │                        ├── Income Statement
  Manual entries   ──────────────                        ├── Balance Sheet
                               │                        ├── Cash Flow
                               └──> bank_accounts       └── VAT Report
                                   (balance updates)
```

### Implementation Order
1. Transaction hook and ledger UI (foundation)
2. Add Transaction dialog with bank balance updates
3. Reconciliation features
4. Auto-record from invoices, expenses, and payslips
5. Balance Sheet report
6. VAT Report
7. Category management enhancements
8. Wire up Accounting page with 5th tab and updated exports
