

# Automated Weekly Data Backup via Email (All Systems)

## Overview

Create a universal data backup system that works across all three system types (Business, Workshop, School). Each user receives a weekly email with CSV attachments of all their relevant data tables -- tailored to their system type. Users can also trigger a manual backup from Settings at any time.

## System-Aware Table Selection

The backup function will determine which tables to export based on the user's `system_type` from their subscription record.

### Shared Tables (all systems)

| Table | Description |
|-------|-------------|
| company_profiles | Company/school profile |
| invoices + invoice_line_items | All invoices |
| staff_members | Staff/teacher records |
| expenses | Expense records |
| tasks | Task records |
| bank_accounts | Banking info |
| contacts | Contact records |
| tax_clearance_documents | Compliance docs |

### School-Only Tables

| Table | Description |
|-------|-------------|
| students | Student records |
| school_classes | Class definitions |
| school_subjects | Subject catalog |
| school_periods | Period/time slot definitions |
| timetable_entries | Timetable assignments |
| academic_terms | Term definitions |
| school_announcements | Announcements |
| fee_schedules | Fee structure |
| student_fee_payments | Payment records |

### Business-Only Tables

| Table | Description |
|-------|-------------|
| clients | Client records |
| leads | Lead/prospect records |
| lead_activities | Lead activity timeline |
| quotes + quote_line_items | Quotation data |
| delivery_note_items | Delivery note details |
| deal_stakeholders | Deal contacts |
| deal_tasks | Deal-specific tasks |
| tender_source_links | Tender tracking |

### Workshop-Only Tables

| Table | Description |
|-------|-------------|
| clients | Client records |
| leads | Lead/prospect records |
| job_cards | Job card records |
| quotes + quote_line_items | Quotation data |

## New Backend Function

### `supabase/functions/export-data-backup/index.ts`

A dual-purpose function handling both manual and automated triggers:

**Manual mode** (user clicks button):
1. Validate JWT from Authorization header
2. Look up user's `system_type` from subscriptions table
3. Query all relevant tables for that user
4. Convert to CSV, send via Resend to their email

**Cron mode** (weekly schedule, no JWT):
1. Fetch all users via `auth.admin.listUsers()`
2. For each user, look up their `system_type`
3. Query relevant tables, generate CSVs, send email
4. Log results for each user

### CSV Generation Logic

- Header row with human-readable column names
- Proper escaping (commas, quotes, newlines)
- UTF-8 encoding
- Dates preserved as ISO strings
- Only non-empty tables included as attachments

### Email Format

- **From**: Configured Resend sender address
- **Subject**: "Your [School/Business/Workshop] Data Backup - [date]"
- **Body**: Summary with table names and row counts
- **Attachments**: One CSV per non-empty table

## Cron Schedule

A `pg_cron` job will call the function every Sunday at midnight UTC:

```text
Schedule: 0 0 * * 0
Target: export-data-backup function
```

This requires enabling `pg_cron` and `pg_net` extensions.

## Settings Page Update

Add a "Data Backup" card to `src/pages/Settings.tsx` with:
- An icon and title ("Data Backup")
- Description explaining the automatic weekly schedule
- A "Send Backup Now" button for on-demand backup
- Loading state while generating
- Success/error toast notifications

The card will be placed after the Notifications card.

## Files

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/export-data-backup/index.ts` | Create | Backend function with system-aware CSV export and Resend email |
| `supabase/config.toml` | Update | Register the new function with `verify_jwt = false` |
| `src/pages/Settings.tsx` | Update | Add Data Backup card with manual trigger button |
| Database migration | Execute | Enable pg_cron + pg_net extensions, schedule weekly job |

## Technical Details

### Edge Function Authentication

- Manual triggers: extract and validate JWT via `supabase.auth.getUser()`, export only that user's data
- Cron triggers: no JWT present, uses service role key to iterate all users

### System Type Resolution

```text
1. Query subscriptions table for user's system_type
2. Default to 'business' if no subscription found
3. Build table list: shared_tables + system_specific_tables
4. Query each table with user_id filter
```

### Security

- Each user only receives their own data (filtered by user_id)
- Service role key used server-side to bypass RLS for efficient multi-table querying
- No sensitive auth data (passwords, tokens) included in exports
- Cron job uses the anon key for the HTTP call; the function uses service role internally

### Dependencies

- **RESEND_API_KEY**: Already configured as a secret
- **pg_cron + pg_net**: Need to be enabled via migration
- No new secrets required

### Error Handling

- If Resend fails for one user during cron, log the error and continue to the next user
- If a specific table query fails, skip it and note it in the email body
- Return detailed summary of successes and failures

