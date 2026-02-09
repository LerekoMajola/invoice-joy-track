

# Hearing Reminder Notifications

## What Changes

You'll receive automatic notifications when court hearings or legal calendar events are approaching. Following legal industry standards, reminders will be sent at **7 days** and **1 day** before a hearing -- giving you enough time to prepare while also catching last-minute items.

## How It Works

A scheduled background function runs daily and checks two sources:
1. **Case hearing dates** (`next_hearing_date` on legal cases)
2. **Calendar events** (hearings, deadlines, filing deadlines from `legal_calendar_events`)

For each upcoming hearing found within the reminder windows (7 days out and 1 day out), it creates an in-app notification and optionally sends a push notification if the user has push enabled.

## Reminder Schedule

| Timing | Notification |
|--------|-------------|
| 7 days before | "Upcoming Hearing in 7 days" -- preparation reminder |
| 1 day before | "Hearing Tomorrow" -- final reminder |
| Day of (overdue/today) | "Hearing Today" -- same-day alert |

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/check-hearing-reminders/index.ts` | **New** -- Edge function that queries upcoming hearings and creates notifications |
| `supabase/config.toml` | Add `verify_jwt = false` for the new function |

A cron job (daily schedule) will also be set up to call this function automatically.

## Technical Details

### Edge Function Logic

The function will:
1. Query `legal_cases` for cases where `next_hearing_date` is within 7 days, 1 day, or today, and status is not `closed`
2. Query `legal_calendar_events` for events where `event_date` is within the same windows and `is_completed = false`
3. Deduplicate (avoid sending duplicate notifications for the same hearing by checking existing notifications with matching `reference_id`)
4. Insert in-app notifications into the `notifications` table with `type = 'system'`, linking to `/legal-cases/CASE_ID`
5. Send push notifications to users who have push subscriptions enabled

### Notification Format

- **7 days**: "Hearing in 7 days: [Case Number] - [Title/Event Title] on [Date]"
- **1 day**: "Hearing Tomorrow: [Case Number] - [Title/Event Title]"
- **Today**: "Hearing Today: [Case Number] - [Title/Event Title] at [Time]"

### Cron Schedule

A daily cron job at 7:00 AM will invoke the function via `pg_cron` + `pg_net`.

### Pattern

This follows the exact same pattern as the existing `check-task-reminders` function -- same Supabase service role client, same notification table structure, same push notification integration.
