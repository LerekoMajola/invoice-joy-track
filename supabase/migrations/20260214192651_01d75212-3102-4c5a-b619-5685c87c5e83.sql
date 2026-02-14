
CREATE TABLE public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  month date NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_date date,
  payment_method text,
  payment_reference text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, month)
);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Admin can manage all subscription payments
CREATE POLICY "Admins can view all subscription payments"
ON public.subscription_payments FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can insert subscription payments"
ON public.subscription_payments FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update subscription payments"
ON public.subscription_payments FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete subscription payments"
ON public.subscription_payments FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

-- Users can view their own payments
CREATE POLICY "Users can view own subscription payments"
ON public.subscription_payments FOR SELECT
USING (auth.uid() = user_id);
