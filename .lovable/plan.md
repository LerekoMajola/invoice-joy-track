
## Fix: Task Reminders Not Sending (Missing Cron Job + Too Infrequent)

### The Problem

The task reminder system has two critical gaps:

1. **No cron job exists for `check-task-reminders`** -- the function is deployed but never gets called automatically. That's why the 10am meeting didn't trigger any notification or email.
2. **Needs frequent execution** -- since tasks can have specific due times (like 10:00 AM) with reminders set to fire minutes before, the cron must run frequently (every 5 minutes) to catch these windows accurately.

### The Fix

**1. Add deduplication to prevent repeat notifications**

The current `check-task-reminders` function doesn't track which reminders have already been sent. If it runs every 5 minutes, it would spam the same notification repeatedly. We need to add deduplication using `reference_id` checks (same pattern used by `check-hearing-reminders`).

**File: `supabase/functions/check-task-reminders/index.ts`**
- Before inserting notifications, query existing notifications to check for duplicates using `reference_id` (e.g., `task-reminder-{task.id}-{due_date}`)
- Add `reference_id` and `reference_type` fields to each notification insert
- Skip any notification whose `reference_id` already exists in the `notifications` table

**2. Schedule the cron job (every 5 minutes)**

Run a SQL command to create the cron job:
```
cron.schedule('check-task-reminders', '*/5 * * * *', ...)
```

This ensures:
- Reminders fire within a 5-minute window of the configured time
- Time-specific tasks (like a 10:00 AM meeting with a "15 min before" reminder) get caught at ~9:45-9:50 AM
- Deduplication prevents repeated notifications on subsequent runs

### Why This Matters

Without this fix, **no task reminders are ever sent automatically** -- not in-app notifications, not push notifications, and not emails (since emails are triggered by the notification insert trigger). This affects all users relying on task reminders for meetings, deadlines, and follow-ups.

### Files Changed

1. **`supabase/functions/check-task-reminders/index.ts`** -- add `reference_id` deduplication logic
2. **Database** -- insert pg_cron job `check-task-reminders` running every 5 minutes
