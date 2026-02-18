

# Admin Invoicing System for Tenant Billing

## Overview
Build a complete invoicing system within the Admin panel that lets you generate professional invoices for tenants, track payment status, and email invoices directly. Invoice numbering starts at **ORN-1001** to project an established business presence.

## What Gets Built

### 1. Database: `admin_invoices` Table
A new table for platform-level invoices issued to tenants:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| tenant_user_id | uuid | The tenant's user ID |
| company_profile_id | uuid | Links to company_profiles |
| invoice_number | text (UNIQUE) | Starts at ORN-1001 |
| company_name | text | Tenant company name |
| tenant_email | text | Where to send |
| line_items | jsonb | Array of {description, quantity, unit_price} |
| subtotal | numeric | Before tax |
| tax_rate | numeric | Default 0 |
| total | numeric | Final amount |
| currency | text | Default 'LSL' |
| status | text | draft / sent / paid / overdue |
| issue_date | date | When issued |
| due_date | date | Payment deadline |
| payment_date | date | When paid (nullable) |
| payment_method | text | bank_transfer, cash, etc. (nullable) |
| payment_reference | text | Reference number (nullable) |
| notes | text | Optional notes |
| created_at / updated_at | timestamptz | Audit timestamps |

RLS: Only super_admin can read/write (using existing `has_role` function).

### 2. New "Invoices" Tab on Admin Page
Added alongside Overview, Customers, Billing, Settings:
- Full list of all admin invoices in a searchable, filterable table
- Status filters: All, Draft, Sent, Paid, Overdue
- Search by company name or invoice number
- Each row shows: Invoice #, Company, Total, Status, Issue Date, Due Date
- Actions: View/Preview, Send Email, Record Payment, Delete

### 3. Generate Invoice Dialog
- Select a tenant (dropdown of all companies)
- Auto-populates company name, email, and active modules as line items
- Editable line items (add/remove/change description, quantity, price)
- Tax rate field (default 0%)
- Due date (default 30 days from today)
- Invoice number auto-generated starting from ORN-1001
- Save as Draft or Send Immediately

### 4. Invoice Preview
- Professional layout with Orion Labs branding at top
- Tenant details as the billed party
- Line items table with quantities and prices
- Subtotal, tax, and total
- Payment terms and due date
- PDF download using existing jspdf/html2canvas setup

### 5. Email Invoice (Edge Function)
- New `send-admin-invoice` edge function
- Sends a styled HTML invoice email from `updates@updates.orionlabslesotho.com`
- Includes all line items, total, due date, and payment instructions
- Updates invoice status to "sent" after successful delivery

### 6. Record Payment
- Mark an invoice as paid with payment date, method, and reference
- Updates status to "paid"

## Invoice Number Sequence
- Format: **ORN-XXXX** (e.g., ORN-1001, ORN-1002, ...)
- Starts at 1001 to give the impression of an established platform
- Auto-increments based on the highest existing number in the database

## Files to Create

| File | Purpose |
|------|---------|
| SQL migration | `admin_invoices` table + RLS policies |
| `src/hooks/useAdminInvoices.tsx` | CRUD hook for admin invoices |
| `src/components/admin/AdminInvoicesTab.tsx` | Main invoices list with filters |
| `src/components/admin/GenerateAdminInvoiceDialog.tsx` | Create/edit invoice dialog |
| `src/components/admin/AdminInvoicePreview.tsx` | Invoice preview with PDF export |
| `supabase/functions/send-admin-invoice/index.ts` | Edge function to email invoices |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Add "Invoices" tab |
| `src/components/admin/index.ts` | Export new components |
| `src/components/admin/SubscriptionsTab.tsx` | Add "Generate Invoice" quick action per tenant |

## Technical Details

### Invoice Number Generation Logic
```text
1. Query admin_invoices for highest invoice_number
2. Extract numeric part (e.g., "ORN-1042" -> 1042)
3. If no invoices exist, start at 1001
4. New number = max + 1, formatted as ORN-XXXX
```

### Line Items Auto-Population
When generating an invoice for a tenant, the dialog will:
1. Fetch the tenant's active modules from `user_modules` joined with `platform_modules`
2. Map each active module to a line item: {description: module name, quantity: 1, unit_price: monthly_price}
3. Allow manual editing before saving

### Email HTML Template
The edge function will render a professional invoice email with:
- Orion Labs header
- Invoice number and dates
- Itemized table
- Total amount in Maluti (M)
- Payment instructions (customizable notes field)

