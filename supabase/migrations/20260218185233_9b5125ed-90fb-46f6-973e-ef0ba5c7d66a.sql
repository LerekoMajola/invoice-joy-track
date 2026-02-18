
-- 1. notify_lead_status_change: add company_profile_id
CREATE OR REPLACE FUNCTION public.notify_lead_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'won' AND (OLD.status IS NULL OR OLD.status != 'won') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, reference_id, reference_type, company_profile_id)
    VALUES (
      NEW.user_id,
      'lead',
      'Deal Won!',
      'Congratulations! Lead ' || NEW.name || COALESCE(' from ' || NEW.company, '') || ' has been won',
      '/crm',
      NEW.id,
      'lead',
      NEW.company_profile_id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. notify_invoice_status_change: add company_profile_id
CREATE OR REPLACE FUNCTION public.notify_invoice_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'overdue' AND (OLD.status IS NULL OR OLD.status != 'overdue') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, reference_id, reference_type, company_profile_id)
    VALUES (
      NEW.user_id,
      'invoice',
      'Invoice Overdue',
      'Invoice ' || NEW.invoice_number || ' for ' || NEW.client_name || ' is now overdue',
      '/invoices',
      NEW.id,
      'invoice',
      NEW.company_profile_id
    );
  END IF;
  
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, reference_id, reference_type, company_profile_id)
    VALUES (
      NEW.user_id,
      'invoice',
      'Payment Received',
      'Invoice ' || NEW.invoice_number || ' has been marked as paid',
      '/invoices',
      NEW.id,
      'invoice',
      NEW.company_profile_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. notify_quote_status_change: add company_profile_id
CREATE OR REPLACE FUNCTION public.notify_quote_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, reference_id, reference_type, company_profile_id)
    VALUES (
      NEW.user_id,
      'quote',
      'Quote Accepted',
      'Quote ' || NEW.quote_number || ' for ' || NEW.client_name || ' has been accepted',
      '/quotes',
      NEW.id,
      'quote',
      NEW.company_profile_id
    );
  END IF;
  
  IF NEW.status = 'expired' AND (OLD.status IS NULL OR OLD.status != 'expired') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, reference_id, reference_type, company_profile_id)
    VALUES (
      NEW.user_id,
      'quote',
      'Quote Expired',
      'Quote ' || NEW.quote_number || ' for ' || NEW.client_name || ' has expired',
      '/quotes',
      NEW.id,
      'quote',
      NEW.company_profile_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. notify_sms_on_notification: pass company_profile_id in payload
CREATE OR REPLACE FUNCTION public.notify_sms_on_notification()
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
    'company_profile_id', NEW.company_profile_id
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
$function$;

-- 5. notify_email_on_notification: pass company_profile_id in payload
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
    'link', NEW.link,
    'company_profile_id', NEW.company_profile_id
  )::text;

  PERFORM net.http_post(
    url := 'https://upjtsekkpjgikrrlfoxv.supabase.co/functions/v1/send-email-notification',
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
$function$;
