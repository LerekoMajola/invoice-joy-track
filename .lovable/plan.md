

## CSV Lead Import Feature

### What It Does

Adds an "Import CSV" button next to the "Add Lead" button on the Leads tab. Users can upload a CSV file containing leads, preview the parsed data in a table, and bulk-import them into the database.

### User Flow

1. Click "Import CSV" button on the Leads tab toolbar
2. A dialog opens with a drag-and-drop / file picker area
3. User selects a CSV file
4. The dialog parses and displays a preview table showing all rows with column mapping
5. User reviews the data, sees any validation warnings (missing name, duplicate emails)
6. Click "Import X Leads" to bulk-insert all valid rows
7. Success toast with count of imported leads; skipped/failed rows shown

### CSV Format Expected

The importer will auto-detect columns by header name (case-insensitive, flexible matching):

| CSV Header | Maps To | Required |
|------------|---------|----------|
| name / contact name / full name | `name` | Yes |
| company / organization | `company` | No |
| email / email address | `email` | No |
| phone / telephone / mobile | `phone` | No |
| source | `source` | No |
| value / estimated value / deal value | `estimated_value` | No |
| priority | `priority` | No |
| status | `status` | No (defaults to "new") |
| notes / comments | `notes` | No |
| follow up / next follow up | `next_follow_up` | No |

A "Download Template" link will provide a sample CSV with the correct headers.

### Technical Details

**New file: `src/components/leads/ImportLeadsDialog.tsx`**

- File input accepts `.csv` files only
- Client-side CSV parsing (no library needed -- split by newlines and commas, handle quoted fields)
- Preview table showing first 100 rows with validation status per row
- Column auto-mapping from header names using a fuzzy match map
- Rows without a `name` value are flagged as invalid (skipped)
- Bulk insert via `supabase.from('leads').insert([...])` with `user_id` and `company_profile_id` set
- Progress indicator during import
- Summary toast: "Imported X leads, Y skipped"

**Modified file: `src/components/crm/LeadsTab.tsx`**

- Add an "Import CSV" button (with Upload icon) next to the existing "Add Lead" button
- Wire up the `ImportLeadsDialog` open/close state
- Add the dialog to the render tree

**Modified file: `src/hooks/useLeads.tsx`**

- Add a `bulkCreateLeads` function that accepts an array of `LeadInsert[]` and inserts them in a single batch call (no per-row duplicate check for performance -- bulk import skips duplicate detection)

### Files Changed

| File | Change |
|------|--------|
| `src/components/leads/ImportLeadsDialog.tsx` | New -- CSV upload dialog with parsing, preview table, column mapping, and bulk import |
| `src/components/crm/LeadsTab.tsx` | Add "Import CSV" button and dialog state |
| `src/hooks/useLeads.tsx` | Add `bulkCreateLeads` method for batch insert |

