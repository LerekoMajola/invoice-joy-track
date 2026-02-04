-- Create plan enum
CREATE TYPE subscription_plan AS ENUM ('free_trial', 'basic', 'standard', 'pro');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'expired');

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan subscription_plan NOT NULL DEFAULT 'free_trial',
  status subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at timestamptz,
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz,
  payment_method text,
  payment_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Usage tracking table
CREATE TABLE public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  clients_count integer DEFAULT 0,
  quotes_count integer DEFAULT 0,
  invoices_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON public.usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();