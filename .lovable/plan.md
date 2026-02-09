

# Upgrade to a Professional Legal Practice Management System

## Current State Assessment

Your legal system has a basic foundation with 5 modules: Dashboard, Cases, Time Tracking, Documents, and Court Calendar. However, each module is minimal -- mostly just list views with basic CRUD. A professional legal practice system needs significantly more depth and workflow integration.

## What Will Be Built

### Phase 1: Core Workflow Improvements (This Plan)

#### 1. Case Detail Dialog with Activity Timeline
- Click any case to open a full detail panel
- View and **edit** all case fields inline (status, priority, court info, parties)
- Activity timeline showing time entries, documents, calendar events, and notes linked to that case
- Add notes directly from the case detail
- Delete cases with confirmation

#### 2. Enhanced Time Entry Management
- **Edit** existing time entries (click to open edit dialog)
- **Delete** time entries with confirmation
- Running timer feature -- start/stop a clock that auto-calculates hours
- Filter entries by case, date range, and billable status
- "Generate Invoice" button that converts selected unbilled time entries into an invoice

#### 3. Case Expenses Tracking
- New database table `legal_case_expenses` for tracking costs per case (filing fees, expert witnesses, travel, etc.)
- Add/edit/delete expenses from the case detail view
- Expenses show in the case profitability breakdown
- Mark expenses as billable or firm-absorbed

#### 4. Calendar Grid View
- Monthly calendar grid showing events color-coded by type (hearings in red, deadlines in amber, meetings in blue)
- Toggle between list view and calendar grid
- Click a day to see events or add new ones
- Edit and delete existing events

#### 5. Case Notes System
- New database table `legal_case_notes` for free-form notes per case
- Add timestamped notes from the case detail panel
- Note categories: General, Court Notes, Client Communication, Research, Strategy

#### 6. Conflict of Interest Check
- When creating a new case, search existing cases for matching opposing party or client names
- Display a warning if a potential conflict is found
- Simple text-matching approach (no AI required)

#### 7. Invoice Generation from Time Entries
- Select unbilled time entries from Time Tracking page
- "Generate Invoice" creates an invoice with line items matching the selected entries
- Marks those time entries as invoiced
- Links invoice back to the case

#### 8. Legal-Specific Reporting
- New "Reports" section accessible from the dashboard or as a sub-tab
- Case load by status (bar chart)
- Revenue by case type (pie chart)
- Billable hours utilization rate (target vs actual)
- Aging of unbilled time entries

## Database Changes

### New Tables

**legal_case_expenses**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | RLS |
| case_id | uuid | FK to legal_cases |
| date | date | |
| amount | numeric | |
| description | text | |
| expense_type | text | filing_fee, expert_witness, travel, court_costs, etc. |
| is_billable | boolean | default true |
| is_invoiced | boolean | default false |
| invoice_id | uuid | nullable |
| receipt_url | text | nullable |
| created_at | timestamptz | |

**legal_case_notes**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | RLS |
| case_id | uuid | FK to legal_cases |
| content | text | |
| category | text | general, court_notes, client_communication, research, strategy |
| created_at | timestamptz | |

Both tables get standard user-based RLS policies (user_id = auth.uid()).

## Files Summary

| File | Action |
|------|--------|
| **Database** | |
| New migration | Create `legal_case_expenses` and `legal_case_notes` tables with RLS |
| **New Hooks** | |
| `src/hooks/useLegalCaseExpenses.tsx` | CRUD for case expenses |
| `src/hooks/useLegalCaseNotes.tsx` | CRUD for case notes |
| **New Components** | |
| `src/components/legal/CaseDetailDialog.tsx` | Full case detail with tabs: Overview, Time, Expenses, Documents, Notes |
| `src/components/legal/CaseActivityTimeline.tsx` | Timeline of all activity on a case |
| `src/components/legal/TimeEntryEditDialog.tsx` | Edit/delete time entries |
| `src/components/legal/CalendarGrid.tsx` | Monthly calendar grid view |
| `src/components/legal/GenerateInvoiceDialog.tsx` | Select time entries and create invoice |
| `src/components/legal/CaseExpenseDialog.tsx` | Add/edit expenses |
| `src/components/legal/ConflictCheckAlert.tsx` | Conflict of interest warning |
| `src/components/legal/LegalReports.tsx` | Charts and reporting |
| **Modified Pages** | |
| `src/pages/LegalCases.tsx` | Add case detail dialog, conflict check on create |
| `src/pages/LegalTimeTracking.tsx` | Add edit/delete, filters, invoice generation, running timer |
| `src/pages/LegalCalendar.tsx` | Add calendar grid toggle, edit/delete events |
| `src/pages/LegalDashboard.tsx` | Add link to reports, improve quick actions |

## Technical Approach

- Case Detail Dialog uses a tabbed layout (Radix Tabs) showing Overview, Time Entries, Expenses, Documents, and Notes for the selected case
- The running timer stores start time in component state and calculates elapsed hours on stop
- Calendar grid is a custom CSS grid (7 columns for days), rendering event badges in each cell
- Conflict check queries existing cases client-side for matching opposing_party or client names
- Invoice generation reuses the existing invoices table and invoice_line_items, inserting rows that mirror the time entries
- Reports use Recharts (already installed) for bar/pie charts
- All new components follow existing patterns: mobile cards + desktop tables, same color scheme, same dialog patterns

