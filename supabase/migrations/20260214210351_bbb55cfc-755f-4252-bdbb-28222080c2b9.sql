
CREATE OR REPLACE FUNCTION public.notify_email_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _payload TEXT;
  _supabase_url TEXT := 'https://upjtsekkpjgikrrlfoxv.supabase.co';
  _service_key TEXT;
BEGIN
  -- Get service role key from vault if available, otherwise use a direct reference
  SELECT decrypted_secret INTO _service_key
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_service_role_key'
  LIMIT 1;

  IF _service_key IS NULL THEN
    -- Fallback: try current_setting
    _service_key := current_setting('app.settings.service_role_key', true);
  END IF;

  IF _service_key IS NULL THEN
    RAISE WARNING 'No service role key found for email notification';
    RETURN NEW;
  END IF;

  _payload := json_build_object(
    'notification_id', NEW.id,
    'user_id', NEW.user_id,
    'title', NEW.title,
    'message', NEW.message,
    'type', NEW.type,
    'link', NEW.link
  )::text;

  PERFORM net.http_post(
    url := _supabase_url || '/functions/v1/send-email-notification',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _service_key
    )::jsonb,
    body := _payload::jsonb
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$function$;
