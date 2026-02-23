
## Fix CSV Import Header Mapping

### Problem
Your CSV file (from Facebook/Meta lead forms) uses headers like `full_name`, `phone_number`, `company_name`, and `lead_status`. While `full_name` and `company_name` are recognized (underscores get normalized to spaces), `phone_number` and `lead_status` are not in the mapping -- so they're ignored.

Additionally, your CSV rows appear to have empty values in the `company_name` and `full_name` columns, which causes all rows to be marked invalid (both fields are currently required).

### Solution

1. **Add more header aliases** to recognize Facebook/Meta lead form columns (`phone_number`, `lead_status`, `ad_name`, `campaign_name`, `platform`, etc.)
2. **Relax validation** so only `contact_name` OR `company_name` is required (not both) -- many lead form CSVs only have a person's name, no company
3. **Map `lead_status`** to the `status` field
4. **Map `phone_number`** to the `phone` field

### Technical Details

**File: `src/components/admin/crm/ImportProspectsDialog.tsx`**

Add these entries to HEADER_MAP:
- `phone number` -> `phone`
- `lead status` -> `status`
- `campaign name` -> `source` (useful context for where the lead came from)
- `platform` -> `source` (fallback if no campaign)
- `ad name` -> `notes`
- `adset name` -> `notes`

Change the validation on line 188 from requiring both company_name AND contact_name to requiring at least one of them. This way Facebook leads that only have a full_name (no company) will still import successfully.

### Files Changed

| File | Change |
|------|--------|
| `src/components/admin/crm/ImportProspectsDialog.tsx` | Add header aliases for Facebook lead form fields; relax validation to require contact_name OR company_name |
| `src/components/leads/ImportLeadsDialog.tsx` | Add same `phone number` and `lead status` aliases for consistency |
