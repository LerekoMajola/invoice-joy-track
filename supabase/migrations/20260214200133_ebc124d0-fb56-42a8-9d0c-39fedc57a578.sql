
-- SMS Credits table
CREATE TABLE public.sms_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL,
  credits_allocated INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE public.sms_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sms credits" ON public.sms_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sms credits" ON public.sms_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sms credits" ON public.sms_credits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sms credits" ON public.sms_credits FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can insert sms credits" ON public.sms_credits FOR INSERT WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can update sms credits" ON public.sms_credits FOR UPDATE USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can delete sms credits" ON public.sms_credits FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- SMS Log table
CREATE TABLE public.sms_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  at_message_id TEXT,
  notification_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sms logs" ON public.sms_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sms logs" ON public.sms_log FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Service role will insert logs from edge functions, so no INSERT policy needed for regular users

-- Trigger to update updated_at on sms_credits
CREATE TRIGGER update_sms_credits_updated_at
  BEFORE UPDATE ON public.sms_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to call edge function on notification insert
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
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-sms-on-notification',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )::jsonb,
    body := _payload::jsonb
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the notification insert if SMS fails
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_sms_on_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_sms_on_notification();
