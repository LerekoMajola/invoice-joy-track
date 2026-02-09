
# Auto-Generate Case Numbers

## What Changes

Currently, the "Case Number" field is a blank text input that you must fill in manually every time you create a case. This will change so that:

- The case number is **automatically generated** when you open the "New Case" dialog
- Format: `CASE-0001`, `CASE-0002`, etc. (incrementing based on your existing cases)
- The field becomes **read-only** so you can see the number but don't need to type it
- Validation no longer requires you to enter a case number manually -- only the title is required

## How It Works

When you click "New Case," the system checks your most recent case number, extracts the number portion, increments it by 1, and pre-fills the field. If you have no cases yet, it starts at `CASE-0001`.

## Technical Details

### File Modified

| File | Change |
|------|--------|
| `src/pages/LegalCases.tsx` | Add auto-generation logic and make the case number field read-only |

### Changes in Detail

1. **Add a helper function** that looks at the existing `cases` array, finds the highest number suffix (e.g., `CASE-0012` yields `12`), increments it, and returns the next case number with zero-padding (e.g., `CASE-0013`)
2. **Pre-fill on dialog open**: When "New Case" is clicked and `setAddOpen(true)` runs, the generated number is set into `form.caseNumber`
3. **Read-only input**: The Case Number input gets a `readOnly` attribute and a muted background so it's clear it's auto-filled
4. **Validation update**: Remove `form.caseNumber` from the required check since it's always auto-filled

No database changes needed -- the `case_number` column remains a plain text field.
