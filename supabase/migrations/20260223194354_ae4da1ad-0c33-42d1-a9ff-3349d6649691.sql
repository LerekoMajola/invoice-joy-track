
-- Create package_change_requests table
CREATE TABLE public.package_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  current_tier_id UUID REFERENCES public.package_tiers(id),
  requested_tier_id UUID NOT NULL REFERENCES public.package_tiers(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.package_change_requests ENABLE ROW LEVEL SECURITY;

-- Tenants can view their own requests
CREATE POLICY "Users can view own requests"
  ON public.package_change_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Tenants can insert their own requests
CREATE POLICY "Users can insert own requests"
  ON public.package_change_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON public.package_change_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Admins can update requests (approve/reject)
CREATE POLICY "Admins can update requests"
  ON public.package_change_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Updated_at trigger
CREATE TRIGGER update_package_change_requests_updated_at
  BEFORE UPDATE ON public.package_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
