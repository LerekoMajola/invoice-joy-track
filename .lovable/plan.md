

## Fix: Duplicate SMS Notifications

### Problem
There are two identical database triggers on the `notifications` table that both call `notify_sms_on_notification()`:
- `on_notification_send_sms`
- `trigger_sms_on_notification`

Every time a notification is inserted, both triggers fire, sending two SMSes to the same number.

### Solution
Drop one of the duplicate triggers. We will keep `on_notification_send_sms` (consistent naming with the email trigger `on_notification_send_email`) and remove `trigger_sms_on_notification`.

### Technical Details

A single database migration to drop the duplicate trigger:

```sql
DROP TRIGGER IF EXISTS trigger_sms_on_notification ON public.notifications;
```

No code changes needed -- just this one-line migration.
