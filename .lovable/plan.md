

## Fix CSV Import to Support Facebook/Meta Lead Exports

### Root Cause

Your Facebook lead form CSV has two issues the current parser can't handle:

1. **UTF-16 encoding** -- The file uses UTF-16 (with a Byte Order Mark), but the parser reads it as UTF-8. This garbles all the text and makes headers unrecognizable.
2. **Tab-separated values** -- Columns are separated by tabs, not commas. The parser only splits on commas, so everything ends up in one column.

### Solution

Update the CSV parser in both import dialogs to:
- Detect and handle UTF-16 encoded files (by reading as UTF-16 when a BOM is detected, or stripping null bytes as a fallback)
- Auto-detect the delimiter (tab vs comma vs semicolon) from the first line
- Pass the detected delimiter to the parsing function

### Technical Details

**File: `src/components/admin/crm/ImportProspectsDialog.tsx`**

1. Add a `detectDelimiter(line)` helper that counts tabs, commas, and semicolons in the header line and picks the most frequent one
2. Update `parseCSVLine(line, delimiter)` to accept and use a configurable delimiter instead of hardcoded comma
3. In the `handleFile` callback, change `reader.readAsText(file)` to `reader.readAsText(file, 'UTF-8')` first, then check if the result contains null bytes (a sign of UTF-16). If so, re-read as UTF-16LE. Alternatively, strip null bytes and the BOM as a simpler approach.
4. After cleaning the text, detect the delimiter from line 1, then pass it to all `parseCSVLine` calls

**File: `src/components/leads/ImportLeadsDialog.tsx`**

Apply the same three fixes (UTF-16 handling, delimiter detection, parameterized parsing) for consistency.

### Changes Summary

| File | Change |
|------|--------|
| `src/components/admin/crm/ImportProspectsDialog.tsx` | Add UTF-16 support, auto-detect delimiter, update `parseCSVLine` to use detected delimiter |
| `src/components/leads/ImportLeadsDialog.tsx` | Same UTF-16 and delimiter detection fixes |

