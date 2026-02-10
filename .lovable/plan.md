

# Recurring Invoices and Quotes

## What This Does

Adds the ability to mark any invoice or quote as "recurring" so the system automatically creates a new copy on a set schedule (weekly, monthly, quarterly, or yearly). You choose the frequency and the system handles the rest -- generating new documents with fresh dates and the next number in sequence.

## How It Works

1. **On any invoice or quote**, you'll see a new "Set as Recurring" option in the actions menu
2. Pick a frequency: Weekly, Monthly, Quarterly, or Yearly
3. The system stores the recurrence rule and a "next run" date
4. A scheduled backend function runs daily, checks for any documents due for regeneration, creates the new invoice/quote with updated dates, and advances the next run date
5. You can stop recurrence at any time by toggling it off

---

## Technical Details

### 1. New Database Table: `recurring_documents`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| source_type | text | `invoice` or `quote` |
| source_id | uuid | The template invoice/quote ID |
| frequency | text | `weekly`, `monthly`, `quarterly`, `yearly` |
| next_run_date | date | When the next copy should be created |
| is_active | boolean | Whether recurrence is enabled |
| last_generated_at | timestamptz | When the last copy was made |
| created_at / updated_at | timestamptz | Timestamps |

RLS policies scoped to user_id.

### 2. New Edge Function: `process-recurring-documents`

- Runs on a daily cron schedule
- Queries `recurring_documents` where `is_active = true` and `next_run_date <= today`
- For each match:
  - Reads the source invoice/quote and its line items
  - Creates a new invoice/quote with fresh dates (today + original offset for due date / valid until)
  - Generates the next sequential number (INV-XXXX or QT-XXXX)
  - Updates `next_run_date` based on frequency
  - Updates `last_generated_at`

### 3. New Hook: `useRecurringDocuments.tsx`

- CRUD operations for the `recurring_documents` table
- `setRecurring(sourceType, sourceId, frequency)` -- creates or updates a recurrence rule
- `stopRecurring(id)` -- sets `is_active` to false
- `getRecurringBySource(sourceType, sourceId)` -- checks if a document has a recurrence rule

### 4. UI Changes

**Invoices page (`src/pages/Invoices.tsx`):**
- Add "Set as Recurring" / "Stop Recurring" option to the dropdown menu for each invoice
- Show a small recurring icon/badge on invoices that have active recurrence

**Quotes page (`src/pages/Quotes.tsx`):**
- Same recurring option in the dropdown menu for each quote
- Same recurring badge indicator

**New component: `SetRecurringDialog.tsx`**
- Simple dialog to pick frequency (Weekly / Monthly / Quarterly / Yearly)
- Shows when the next document will be generated
- Option to deactivate recurrence

### 5. Cron Job Setup

A daily cron job calling the `process-recurring-documents` edge function at midnight.

---

## Files

| File | Action |
|------|--------|
| Database migration | New table `recurring_documents` with RLS |
| `supabase/functions/process-recurring-documents/index.ts` | New -- edge function to generate recurring docs |
| `src/hooks/useRecurringDocuments.tsx` | New -- hook for managing recurrence rules |
| `src/components/shared/SetRecurringDialog.tsx` | New -- frequency picker dialog |
| `src/pages/Invoices.tsx` | Update -- add recurring menu option + badge |
| `src/pages/Quotes.tsx` | Update -- add recurring menu option + badge |

