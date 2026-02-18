
## Email Reminders for Stale Tender Source Links

### Current State
The system already has:
- A `check-tender-links` function that runs daily at 8 AM via a cron job
- It creates in-app notifications for links not visited in 2+ days
- A database trigger (`notify_email_on_notification`) that automatically sends emails when notifications are inserted

### The Problem
The `check-tender-links` function is missing two things:
1. It doesn't fetch `company_profile_id` from the tender source links
2. It doesn't include `company_profile_id` when inserting the notification

Without `company_profile_id`, the email function can't resolve the correct business email for the user, so emails may go to the wrong address or fail silently.

### The Fix

**File: `supabase/functions/check-tender-links/index.ts`**

Two small changes:

1. Add `company_profile_id` to the select query:
   - Change: `.select("id, user_id, name, last_visited_at")`
   - To: `.select("id, user_id, name, last_visited_at, company_profile_id")`

2. Include `company_profile_id` in the notification insert:
   - Add `company_profile_id: link.company_profile_id` to the insert object

This ensures the existing email trigger pipeline has the company context it needs to deliver emails to the correct business email address.

No new functions, no new cron jobs, no database changes needed -- everything else is already wired up.
