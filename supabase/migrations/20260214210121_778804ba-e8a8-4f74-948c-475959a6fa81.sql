
-- Create trigger function to call send-email-notification edge function
CREATE OR REPLACE FUNCTION public.notify_email_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _payload TEXT;
BEGIN
  _payload := json_build_object(
    'notification_id', NEW.id,
    'user_id', NEW.user_id,
    'title', NEW.title,
    'message', NEW.message,
    'type', NEW.type,
    'link', NEW.link
  )::text;

  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-email-notification',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )::jsonb,
    body := _payload::jsonb
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the notification insert if email fails
  RETURN NEW;
END;
$function$;

-- Create trigger on notifications table
CREATE TRIGGER on_notification_send_email
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_email_on_notification();
