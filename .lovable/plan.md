

# Legal Practice Management System

## Overview
Add a fourth industry vertical -- **Legal** -- to the platform, alongside Business, Workshop, and School. This system is designed for law firms, solo attorneys, and legal practitioners, featuring case/matter management, billable time tracking, document management, and a court calendar.

Starting price: **M500/mo**

## Phase Breakdown

This is a large feature. We will build it in **4 phases** to keep each step manageable and testable.

---

## Phase 1: Foundation (System Registration + Dashboard)

Wire up "Legal" as a recognized system type throughout the platform so users can sign up, see a legal dashboard, and navigate legal-specific pages.

### Database Changes

1. **Insert legal-specific modules** into `platform_modules`:
   - `legal_cases` -- "Cases & Matters" (system_type: legal)
   - `legal_billing` -- "Billing & Time Tracking" (system_type: legal)
   - `legal_documents` -- "Document Management" (system_type: legal)
   - `legal_calendar` -- "Court Calendar" (system_type: legal)

### Code Changes

| File | Change |
|------|--------|
| `src/components/auth/SystemSelector.tsx` | Add `'legal'` to `SystemType` union; add Legal card with `Scale` icon, emerald/teal gradient, M500 price |
| `src/hooks/useSubscription.tsx` | Add `'legal'` to `SystemType` union |
| `src/components/auth/PackageTierSelector.tsx` | Add `legalTiers` array (Starter M500, Professional M700, Enterprise M950) with module key mappings |
| `src/components/landing/PricingTable.tsx` | Add Legal tab with matching tiers |
| `src/pages/Auth.tsx` | Include `'legal'` in the system param validation array; add Legal meta to `SYSTEM_META` |
| `src/pages/Dashboard.tsx` | Add lazy import for `LegalDashboard`; render when `systemType === 'legal'` |
| `src/pages/LegalDashboard.tsx` | **New file** -- Legal-themed dashboard with stats (Active Cases, Unbilled Hours, Revenue, Upcoming Hearings), quick actions, and motivational quotes |
| `src/components/layout/Sidebar.tsx` | Add legal-specific nav items: Cases, Time Tracking, Legal Docs, Court Calendar |
| `src/components/layout/BottomNav.tsx` | Add legal bottom nav items (Cases, Time, Calendar) |
| `src/components/layout/MoreMenuSheet.tsx` | Add legal menu entries |
| `src/components/admin/ModuleManagement.tsx` | Add Legal group with `Scale` icon and emerald gradient |

---

## Phase 2: Cases & Matters

The core feature -- managing legal cases.

### Database Changes

Create `legal_cases` table:
- `id`, `user_id`, `case_number` (text, unique per user), `title`, `client_id` (FK to clients), `case_type` (civil, criminal, family, commercial, labour, other), `status` (open, in_progress, on_hold, closed, archived), `court_name`, `court_case_number`, `opposing_party`, `opposing_counsel`, `judge_name`, `filing_date`, `next_hearing_date`, `description`, `notes`, `created_at`, `updated_at`
- RLS: user_id = auth.uid()

Create `legal_case_notes` table:
- `id`, `case_id` (FK), `user_id`, `note_type` (general, hearing, filing, client_communication), `content` (text), `created_at`
- RLS: via parent case ownership

### Code Changes

| File | Change |
|------|--------|
| `src/hooks/useLegalCases.tsx` | **New** -- CRUD hook for legal cases with filters by status/type |
| `src/pages/LegalCases.tsx` | **New** -- Cases list page with tabs (All, Open, In Progress, Closed), search, add case dialog |
| `src/components/legal/AddCaseDialog.tsx` | **New** -- Form to create a case: title, client, type, court info, dates |
| `src/components/legal/CaseDetailDialog.tsx` | **New** -- Full case detail view with notes timeline, edit capability |
| `src/App.tsx` | Add `/legal-cases` route |

---

## Phase 3: Billing & Time Tracking

Track billable hours per case and generate invoices from time entries.

### Database Changes

Create `legal_time_entries` table:
- `id`, `user_id`, `case_id` (FK to legal_cases), `date`, `hours` (numeric), `hourly_rate` (numeric), `description`, `is_billable` (boolean, default true), `is_invoiced` (boolean, default false), `invoice_id` (nullable FK to invoices), `created_at`
- RLS: user_id = auth.uid()

Create `legal_trust_accounts` table:
- `id`, `user_id`, `client_id` (FK), `balance` (numeric), `account_name`, `created_at`, `updated_at`
- RLS: user_id = auth.uid()

### Code Changes

| File | Change |
|------|--------|
| `src/hooks/useLegalTimeEntries.tsx` | **New** -- CRUD for time entries, totals per case |
| `src/pages/LegalTimeTracking.tsx` | **New** -- Time entry list with running timer option, filter by case, date range; weekly summary |
| `src/components/legal/AddTimeEntryDialog.tsx` | **New** -- Quick time entry form (case select, hours, rate, description) |
| `src/components/legal/GenerateInvoiceFromTime.tsx` | **New** -- Select unbilled time entries for a case, generate an invoice with line items auto-populated |
| `src/App.tsx` | Add `/legal-time-tracking` route |

---

## Phase 4: Document Management & Court Calendar

### Database Changes

Create `legal_documents` table:
- `id`, `user_id`, `case_id` (FK), `document_type` (contract, pleading, affidavit, correspondence, evidence, court_order, other), `title`, `file_url` (storage), `file_size`, `notes`, `created_at`
- RLS: user_id = auth.uid()

Create `legal_calendar_events` table:
- `id`, `user_id`, `case_id` (FK, nullable), `event_type` (hearing, filing_deadline, consultation, mediation, trial, other), `title`, `date`, `time`, `location`, `description`, `reminder_date`, `is_completed` (boolean), `created_at`
- RLS: user_id = auth.uid()

Storage bucket: `legal-documents` (private)

### Code Changes

| File | Change |
|------|--------|
| `src/hooks/useLegalDocuments.tsx` | **New** -- Upload, list, delete documents per case |
| `src/pages/LegalDocuments.tsx` | **New** -- Document library with filters by case and type; upload dialog |
| `src/components/legal/UploadDocumentDialog.tsx` | **New** -- Upload form with case select, type, title |
| `src/hooks/useLegalCalendar.tsx` | **New** -- CRUD for calendar events |
| `src/pages/LegalCalendar.tsx` | **New** -- Calendar view (month/week) with event list, upcoming deadlines prominently shown |
| `src/components/legal/AddCalendarEventDialog.tsx` | **New** -- Event form: type, case link, date/time, location, reminder |
| `src/App.tsx` | Add `/legal-documents` and `/legal-calendar` routes |

---

## Package Tiers

| Tier | Price | Modules |
|------|-------|---------|
| **Starter** | M500/mo | Cases & Matters, Invoices, Tasks, Staff |
| **Professional** | M700/mo | + Billing & Time Tracking, Accounting, Document Management |
| **Enterprise** | M950/mo | + Court Calendar, CRM & Clients (full suite) |

---

## Implementation Order

We will build **Phase 1 first** (foundation + dashboard + navigation + signup), then proceed phase by phase. Each phase is independently testable and deployable.

