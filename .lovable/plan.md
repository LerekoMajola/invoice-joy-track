## Statement of Account

A printable/sendable summary per client showing invoices, payments, and outstanding balance over a selected period.

### Where it lives
- **Clients page** → each client row gets a new "Statement" action (alongside existing actions).
- **Client detail dialog** → new "Statement of Account" tab/section.
- Optional shortcut from **Invoices page** → "Generate Statement" button filtered by selected client.

### What the statement shows
Header
- Company branding (logo, name, address, contact) — reused from invoice/quote templates.
- "STATEMENT OF ACCOUNT" title + statement number (auto: `STM-YYYYMM-####`).
- Bill-to (client name, contact, address).
- Statement date + period (From / To, defaults to last 90 days, user-adjustable).

Opening balance
- Sum of outstanding invoices dated before the period start.

Transactions table (chronological)
| Date | Reference | Description | Debit (Invoice) | Credit (Payment) | Balance |
- Each invoice in period → debit row.
- Each recorded payment in period (from invoices with `payment_date` in range and status `paid`) → credit row.

Summary footer
- Opening balance
- Total invoiced (period)
- Total paid (period)
- **Closing balance / Amount due**
- Aging buckets: Current, 1–30, 31–60, 61–90, 90+ days overdue.

Actions
- Download PDF (uses existing `exportSectionBasedPDF` pattern from invoice preview).
- Send via Email (uses existing `send-email-notification` infra / Resend with PDF attachment).
- Print.

### Technical Section

**Data source (no schema changes needed)**
- Pull from existing `invoices` table filtered by `client_id` + date range.
- Payments derived from invoice fields `payment_date`, `total`, `status='paid'`, `payment_reference`, `payment_method` (current model — no separate payments table).
- Outstanding = invoices where `status IN ('sent','overdue')` (and partials if introduced later).

**New files**
- `src/hooks/useClientStatement.tsx` — fetches invoices for client + range, computes opening balance, transactions, aging.
- `src/components/clients/StatementOfAccountDialog.tsx` — dialog wrapping the preview with date pickers + actions.
- `src/components/clients/StatementPreview.tsx` — print-ready layout (mirrors `InvoicePreview` styling for brand consistency).
- `src/lib/statementCalculations.ts` — pure helpers (running balance, aging buckets).
- `supabase/functions/send-statement-email/index.ts` — accepts client id + period, renders HTML, sends via Resend.

**Edits**
- `src/pages/Clients.tsx` — add "Statement" action.
- `src/components/clients/` (existing client detail dialog) — add "Statement of Account" section.
- Use `useCurrency()` for all amounts (never hardcode `M`).
- PDF via `exportSectionBasedPDF` (html2canvas scale 2), solid background per design rules.

**Numbering**
- Statement numbers are local-only (not persisted unless requested later) — generated as `STM-YYYYMMDD-<clientShortId>` at render time. No DB column needed initially.

### Out of scope (for confirmation)
- Recording partial payments (current model is one payment per invoice).
- Persisting generated statements / statement history.
- Recurring auto-statements (e.g. monthly auto-email) — can be added later via cron-like edge function.

Confirm and I'll implement.
