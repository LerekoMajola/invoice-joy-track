

## Fix Email and SMS Notification Delivery

### Root Causes Found

**SMS: Database settings are NULL**
The `notify_sms_on_notification()` trigger function calls `current_setting('app.settings.supabase_url', true)` and `current_setting('app.settings.service_role_key', true)` to build the HTTP request URL and auth header. Both return NULL because these PostgreSQL settings were never configured. The `EXCEPTION WHEN OTHERS` block silently swallows the resulting error, so notifications insert fine but no SMS is ever sent.

**Email: Domain not verified at Resend**
The `notify_email_on_notification()` trigger does fire and reaches the Edge Function, but Resend returns a 403 because `orionlabslesotho.com` is not yet verified. This requires DNS changes on your domain registrar -- it cannot be fixed in code.

### Fix Plan

**1. Fix SMS trigger function (database migration)**

Replace the `notify_sms_on_notification()` function to hardcode the project URL and use the service role key secret (matching how the email trigger works):

```sql
CREATE OR REPLACE FUNCTION public.notify_sms_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _payload TEXT;
BEGIN
  _payload := json_build_object(
    'notification_id', NEW.id,
    'user_id', NEW.user_id,
    'title', NEW.title,
    'message', NEW.message
  )::text;

  PERFORM net.http_post(
    url := 'https://upjtsekkpjgikrrlfoxv.supabase.co/functions/v1/send-sms-on-notification',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'apikey', '<anon_key>',
      'Authorization', 'Bearer <anon_key>'
    )::jsonb,
    body := _payload::jsonb
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;
```

This mirrors the working pattern used by the email trigger, ensuring the HTTP call to the Edge Function actually fires.

**2. Fix phone number format**

Your stored phone is `+266 58335233` (with a space). The Africa's Talking API expects no spaces. The `send-sms` Edge Function should strip spaces before sending. A small code update to `supabase/functions/send-sms/index.ts` will sanitize the phone number.

**3. Email -- action required from you**

Email will continue to fail until you verify your domain in Resend. You need to:
- Log into your Resend dashboard
- Go to Domains and check `orionlabslesotho.com`
- Add the required DNS records (DKIM, SPF, MX) at your domain registrar
- Wait for verification to complete

No code change can fix this -- it's a third-party provider requirement.

### Summary of Code Changes

| File | Change |
|------|--------|
| Database migration | Replace `notify_sms_on_notification()` with hardcoded URL |
| `supabase/functions/send-sms/index.ts` | Sanitize phone number (strip spaces) |

### Testing

After the migration, we will trigger a test notification and check the `sms_log` table and Edge Function logs to confirm SMS delivery.
