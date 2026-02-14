

## Fix Email Notifications - Two Issues

### Issue 1: Missing Database Trigger (code fix)
The function `notify_email_on_notification()` exists in the database, but no trigger is attached to the `notifications` table to invoke it. A new migration will create:

```sql
CREATE TRIGGER on_notification_send_email
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_email_on_notification();
```

This will also re-create the SMS trigger that was previously missing:

```sql
CREATE TRIGGER on_notification_send_sms
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_sms_on_notification();
```

### Issue 2: DNS Records Still Pending (action required from you)
Your Resend domain shows SPF records as **Pending**. You need to add these at your domain registrar (where you manage DNS for `orionlabslesotho.com`):

- **MX record**: Host = `send.updates`, Value = the feedback-smtp address shown in Resend, Priority = 10
- **TXT record**: Host = `send.updates`, Value = the SPF value shown in Resend (`v=spf1 include...`)

DNS propagation can take up to 48 hours. However, Resend may still allow sending with just DKIM verified -- we will test after adding the trigger.

### Testing Plan
After the trigger is created, we will directly invoke the Edge Function to confirm it works, then test end-to-end by changing an invoice to "paid" or "overdue" status.

