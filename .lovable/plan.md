

# Legal System Navigation & Module Fix

## Problem
The legal system sidebar is showing business-oriented modules (Clients, CRM) and generic shared items, but is missing legal-specific pages. Additionally, the legal pages have **no routes defined** in `App.tsx`, so navigating to `/legal-cases`, `/legal-time-tracking`, `/legal-documents`, or `/legal-calendar` would show a 404 page.

## What Changes

### 1. Update Sidebar Navigation (`src/components/layout/Sidebar.tsx`)

**Add "Clients" for legal users** -- law firms need client management too, so include `'legal'` in the Clients systemTypes array.

**Hide irrelevant shared modules for legal**:
- CRM pipeline view is business-specific (already hidden -- correct)
- Quotes, Tenders, Delivery Notes are business-only (already hidden -- correct)
- Keep Invoices, Tasks, Staff, Accounting, Settings, Billing as shared (legal firms use all of these)

The current sidebar config is actually mostly correct. The main fix is:
- Add `'legal'` to the Clients nav item so legal users can manage their clients
- Ensure legal nav order makes sense: Cases first, then Clients, Time Tracking, Legal Docs, Court Calendar

### 2. Create Legal Page Components (4 new files)

| File | Purpose |
|------|---------|
| `src/pages/LegalCases.tsx` | Cases & Matters management -- list, add, view cases |
| `src/pages/LegalTimeTracking.tsx` | Time entry logging and billable hours tracking |
| `src/pages/LegalDocuments.tsx` | Document management with file upload |
| `src/pages/LegalCalendar.tsx` | Court calendar with deadlines and hearing dates |

Each page will follow the existing dashboard layout pattern with `DashboardLayout`, `Header`, and appropriate CRUD dialogs.

### 3. Add Routes to `App.tsx`

Register four new protected routes:
- `/legal-cases`
- `/legal-time-tracking`
- `/legal-documents`
- `/legal-calendar`

### 4. Update platform_modules (database)

Currently `core_crm` is `system_type: 'shared'`, which means legal users who subscribe to it see "Clients" and "CRM". We should:
- Keep `core_crm` as shared (it genuinely is cross-system for client management)
- The sidebar already gates CRM to `['business']` only, so legal users get Clients but not CRM pipeline -- which is correct

## Sidebar for Legal Users (after changes)

```text
Dashboard
Cases           (legal_cases)
Clients         (core_crm -- now includes 'legal')
Time Tracking   (legal_billing)
Legal Docs      (legal_documents)
Court Calendar  (legal_calendar)
------- shared -------
Invoices
Tasks
Staff
Accounting
Settings
Billing
```

## Technical Details

### Legal Cases Page
- Uses existing `useLegalCases` hook
- Table/list view with case number, title, type, status, priority, assigned lawyer
- Add Case dialog with full form (case number, title, type, court info, client link)
- Status badges: Open (emerald), In Progress (blue), On Hold (amber), Closed (gray)

### Legal Time Tracking Page
- Uses existing `useLegalTimeEntries` hook
- Log time entries with case selection, hours, rate, description, activity type
- Summary showing total billable/unbilled hours
- Filter by case, date range, billable status

### Legal Documents Page
- Uses Supabase storage bucket `legal-documents` (already exists)
- Upload files linked to cases
- View/download documents
- Categorize by type (contract, agreement, court paper, evidence, other)

### Legal Calendar Page
- Uses existing `useLegalCalendar` hook
- Calendar view or list view of upcoming events
- Add events with type (hearing, deadline, meeting, filing), date, time, location
- Priority-based color coding
- Link events to cases

### Files Summary

| File | Action |
|------|--------|
| `src/pages/LegalCases.tsx` | Create |
| `src/pages/LegalTimeTracking.tsx` | Create |
| `src/pages/LegalDocuments.tsx` | Create |
| `src/pages/LegalCalendar.tsx` | Create |
| `src/App.tsx` | Add 4 new routes |
| `src/components/layout/Sidebar.tsx` | Add 'legal' to Clients systemTypes |

No database changes needed -- all tables and storage buckets already exist.
