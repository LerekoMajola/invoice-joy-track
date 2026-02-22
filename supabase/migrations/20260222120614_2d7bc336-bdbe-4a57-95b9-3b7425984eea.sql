
-- Create gym_invoice_logs table
CREATE TABLE public.gym_invoice_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_profile_id UUID REFERENCES public.company_profiles(id),
  member_id UUID NOT NULL,
  subscription_id UUID NOT NULL,
  billing_month TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, billing_month)
);

-- Enable RLS
ALTER TABLE public.gym_invoice_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own logs
CREATE POLICY "Users can view their own gym invoice logs"
  ON public.gym_invoice_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role inserts (from edge function), but allow user insert too
CREATE POLICY "Users can insert their own gym invoice logs"
  ON public.gym_invoice_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
