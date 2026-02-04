

# Accounting Module

## Overview
Add a comprehensive Accounting module that provides SMEs with essential bookkeeping capabilities including expense tracking, bank account management, cash flow analysis, and financial reports. This integrates with existing invoice and payroll data to give a complete financial picture.

---

## Feature Summary

| Feature | Description |
|---------|-------------|
| **Expense Tracking** | Record business expenses with categories, receipts, and vendor info |
| **Bank Accounts** | Track multiple bank accounts and their balances |
| **Cash Flow** | Real-time view of money in vs money out |
| **Financial Reports** | Income statement, expense breakdown, profit & loss summary |
| **Chart of Accounts** | Standard account categories for proper bookkeeping |
| **Reconciliation** | Match transactions with bank statements |

---

## Architecture

### Data Flow Integration

```text
+----------------+     +----------------+     +-------------------+
|   Invoices     |---->|                |     |                   |
|   (Revenue)    |     |   Accounting   |---->|  Financial        |
+----------------+     |   Dashboard    |     |  Reports          |
                       |                |     |                   |
+----------------+     |   - Cash In    |     |  - P&L Summary    |
|   Expenses     |---->|   - Cash Out   |     |  - Expense Report |
|   (Outflows)   |     |   - Balance    |     |  - Cash Flow      |
+----------------+     |                |     +-------------------+
                       |                |
+----------------+     |                |
|   Payslips     |---->|                |
|   (Payroll)    |     +----------------+
+----------------+
```

---

## Database Schema

### 1. Expense Categories Table

```sql
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT 'gray',
  is_system BOOLEAN DEFAULT false,  -- Cannot delete system categories
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Seed with standard categories per user (via trigger or first-load)
-- Examples: Office Supplies, Travel, Utilities, Marketing, Professional Services, 
-- Equipment, Rent, Insurance, Maintenance, Miscellaneous
```

### 2. Expenses Table

```sql
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'LSL',
  
  vendor_name TEXT,
  description TEXT NOT NULL,
  reference_number TEXT,  -- Invoice/receipt number
  receipt_url TEXT,       -- Uploaded receipt image
  
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,  -- monthly, weekly, yearly
  
  payment_method TEXT,  -- cash, bank_transfer, card, mobile_money
  status TEXT DEFAULT 'pending',  -- pending, paid, cancelled
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. Bank Accounts Table

```sql
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  account_name TEXT NOT NULL,
  account_number TEXT,
  bank_name TEXT,
  account_type TEXT DEFAULT 'checking',  -- checking, savings, mobile_money
  currency TEXT DEFAULT 'LSL',
  
  opening_balance NUMERIC DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, account_name)
);
```

### 4. Transactions Table (For Reconciliation)

```sql
CREATE TABLE public.accounting_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
  
  transaction_type TEXT NOT NULL,  -- income, expense, transfer
  reference_type TEXT,  -- invoice, expense, payslip, manual
  reference_id UUID,    -- Links to invoices.id, expenses.id, payslips.id
  
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,  -- Positive for income, negative for expense
  running_balance NUMERIC,
  
  description TEXT,
  is_reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. RLS Policies

```sql
-- All tables use standard user_id pattern
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_transactions ENABLE ROW LEVEL SECURITY;

-- Standard policies for each
CREATE POLICY "Users can manage own [table]"
  ON [table] FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## UI Structure

### Accounting Page with Tabs

```text
/accounting
  ├── Overview Tab
  │   ├── Cash Flow Summary (Money In / Money Out / Net)
  │   ├── Quick Stats Cards
  │   ├── Recent Transactions List
  │   └── Expense by Category Chart
  │
  ├── Expenses Tab
  │   ├── Add Expense button
  │   ├── Filter by category, date range, status
  │   ├── Expense list/table
  │   └── Expense category breakdown chart
  │
  ├── Bank Accounts Tab
  │   ├── Add Account button
  │   ├── Account cards with balances
  │   ├── Transaction list per account
  │   └── Reconciliation status
  │
  └── Reports Tab
      ├── Date range selector
      ├── Income Statement (Revenue - Expenses = Net)
      ├── Expense Report by Category
      └── Cash Flow Statement
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Accounting.tsx` | Main accounting page with tabs |
| `src/hooks/useExpenses.tsx` | Expense CRUD operations |
| `src/hooks/useBankAccounts.tsx` | Bank account management |
| `src/hooks/useAccountingStats.tsx` | Financial calculations and aggregations |
| `src/components/accounting/OverviewTab.tsx` | Dashboard overview |
| `src/components/accounting/ExpensesTab.tsx` | Expense management |
| `src/components/accounting/BankAccountsTab.tsx` | Bank accounts |
| `src/components/accounting/ReportsTab.tsx` | Financial reports |
| `src/components/accounting/AddExpenseDialog.tsx` | Create/edit expense |
| `src/components/accounting/AddBankAccountDialog.tsx` | Create/edit account |
| `src/components/accounting/ExpenseCategoryChart.tsx` | Pie/donut chart |
| `src/components/accounting/CashFlowChart.tsx` | Line/bar chart |
| `src/components/accounting/IncomeStatement.tsx` | P&L report component |
| `src/components/accounting/index.ts` | Barrel exports |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/accounting` route |
| `src/components/layout/Sidebar.tsx` | Add Accounting nav item with `Calculator` icon |

---

## Key Components

### Overview Tab Stats Cards

| Card | Calculation |
|------|-------------|
| Total Revenue | Sum of paid invoices for period |
| Total Expenses | Sum of paid expenses for period |
| Payroll Costs | Sum of paid payslips for period |
| Net Cash Flow | Revenue - Expenses - Payroll |
| Cash on Hand | Sum of all bank account balances |
| Outstanding | Unpaid invoices total |

### Expense Form Fields

| Field | Type | Required |
|-------|------|----------|
| Date | Date picker | Yes |
| Amount | Number input | Yes |
| Category | Select dropdown | Yes |
| Vendor/Payee | Text input | No |
| Description | Textarea | Yes |
| Payment Method | Select | No |
| Bank Account | Select (if tracking) | No |
| Reference Number | Text | No |
| Receipt | File upload | No |
| Recurring | Toggle + frequency | No |

### Bank Account Card

```text
+----------------------------------------+
| [Icon] Business Checking      [Primary] |
| Standard Lesotho Bank                   |
| ****4567                                |
+----------------------------------------+
| Current Balance                         |
| M 45,230.00                             |
+----------------------------------------+
| Last reconciled: Feb 1, 2026           |
| [Reconcile] [Transactions] [Edit]      |
+----------------------------------------+
```

---

## Integration Points

### 1. Invoice Integration (Revenue)
- When invoice marked as "paid", automatically create an accounting transaction
- Links back to invoice for drill-down

### 2. Payroll Integration (Expense)
- When payslip marked as "paid", create expense transaction
- Category: "Payroll" (system category)
- Links back to payslip

### 3. Expense to Bank Account
- When expense paid, update bank account balance
- Create transaction record for reconciliation

---

## Financial Calculations

### Income Statement (P&L)

```text
INCOME STATEMENT
For Period: [Start Date] - [End Date]

REVENUE
  Sales Revenue (Paid Invoices)    M xxx,xxx.xx
  Other Income                     M xxx,xxx.xx
                                   ─────────────
  TOTAL REVENUE                    M xxx,xxx.xx

EXPENSES
  Office Supplies                  M xx,xxx.xx
  Travel                           M xx,xxx.xx
  Utilities                        M xx,xxx.xx
  Marketing                        M xx,xxx.xx
  Professional Services            M xx,xxx.xx
  Payroll                          M xx,xxx.xx
  Other Expenses                   M xx,xxx.xx
                                   ─────────────
  TOTAL EXPENSES                   M xxx,xxx.xx

NET INCOME                         M xxx,xxx.xx
```

### Cash Flow Summary

```typescript
const cashFlowStats = useMemo(() => {
  // Money In: Paid invoices in period
  const moneyIn = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  
  // Money Out: Paid expenses + Paid payslips
  const expensesOut = paidExpenses.reduce((sum, e) => sum + e.amount, 0);
  const payrollOut = paidPayslips.reduce((sum, p) => sum + p.netPay, 0);
  const moneyOut = expensesOut + payrollOut;
  
  // Net Flow
  const netFlow = moneyIn - moneyOut;
  
  return { moneyIn, moneyOut, netFlow };
}, [paidInvoices, paidExpenses, paidPayslips]);
```

---

## Default Expense Categories

| Category | Icon | Color |
|----------|------|-------|
| Office Supplies | `Package` | blue |
| Travel | `Plane` | purple |
| Utilities | `Zap` | yellow |
| Marketing | `Megaphone` | pink |
| Professional Services | `Briefcase` | indigo |
| Equipment | `Monitor` | gray |
| Rent | `Building` | amber |
| Insurance | `Shield` | green |
| Maintenance | `Wrench` | orange |
| Payroll | `Users` | sky (system) |
| Miscellaneous | `Folder` | slate |

---

## Receipt Upload

Use existing storage pattern with `company-assets` bucket:
- Path: `receipts/{user_id}/{expense_id}.{ext}`
- Accept: jpg, png, pdf
- Show thumbnail preview in expense list

---

## Security Considerations

1. **RLS on All Tables**: Standard user_id pattern for multi-tenancy
2. **File Access**: Receipts stored with user-scoped paths
3. **Sensitive Data**: Bank account numbers partially masked in UI
4. **Audit Trail**: Transaction records maintain history

---

## Summary

| Category | Count |
|----------|-------|
| New database tables | 4 |
| New pages | 1 |
| New hooks | 3 |
| New components | 12+ |
| Modified files | 2 (App.tsx, Sidebar.tsx) |
| Charts | 2 (Category breakdown, Cash flow) |
| Reports | 3 (Income Statement, Expense Report, Cash Flow) |

This accounting module provides SMEs with essential bookkeeping tools while integrating seamlessly with the existing invoicing and payroll systems to provide a complete financial picture of the business.

