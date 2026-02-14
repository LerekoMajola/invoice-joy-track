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
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwanRzZWtrcGpnaWtycmxmb3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMDM0ODEsImV4cCI6MjA4MjU3OTQ4MX0.gLZTIouO429iFJRaAh-VUpZakUvnSmxwZmFHeeJnTUU',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwanRzZWtrcGpnaWtycmxmb3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMDM0ODEsImV4cCI6MjA4MjU3OTQ4MX0.gLZTIouO429iFJRaAh-VUpZakUvnSmxwZmFHeeJnTUU'
    )::jsonb,
    body := _payload::jsonb
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;