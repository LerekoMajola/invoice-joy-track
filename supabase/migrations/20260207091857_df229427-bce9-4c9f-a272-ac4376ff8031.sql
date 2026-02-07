
-- Create platform_modules table (defines available modules)
CREATE TABLE public.platform_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  description TEXT,
  monthly_price NUMERIC NOT NULL DEFAULT 0,
  icon TEXT DEFAULT 'package',
  is_core BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on platform_modules
ALTER TABLE public.platform_modules ENABLE ROW LEVEL SECURITY;

-- Everyone can read modules (public catalog)
CREATE POLICY "Anyone can view active modules"
ON public.platform_modules
FOR SELECT
USING (true);

-- Only super_admins can insert modules
CREATE POLICY "Super admins can insert modules"
ON public.platform_modules
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Only super_admins can update modules
CREATE POLICY "Super admins can update modules"
ON public.platform_modules
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Only super_admins can delete modules
CREATE POLICY "Super admins can delete modules"
ON public.platform_modules
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create user_modules table (tracks user subscriptions to modules)
CREATE TABLE public.user_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.platform_modules(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS on user_modules
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

-- Users can view their own modules
CREATE POLICY "Users can view own modules"
ON public.user_modules
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own modules
CREATE POLICY "Users can insert own modules"
ON public.user_modules
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own modules
CREATE POLICY "Users can update own modules"
ON public.user_modules
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own modules
CREATE POLICY "Users can delete own modules"
ON public.user_modules
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all user modules
CREATE POLICY "Admins can view all user modules"
ON public.user_modules
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can update all user modules
CREATE POLICY "Admins can update all user modules"
ON public.user_modules
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at on platform_modules
CREATE TRIGGER update_platform_modules_updated_at
BEFORE UPDATE ON public.platform_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on user_modules
CREATE TRIGGER update_user_modules_updated_at
BEFORE UPDATE ON public.user_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the platform_modules table with initial modules
INSERT INTO public.platform_modules (name, key, description, monthly_price, icon, is_core, is_active, sort_order) VALUES
  ('Core (CRM + Clients)', 'core_crm', 'Client management, leads, contacts — always included', 100, 'Users', true, true, 1),
  ('Quotes', 'quotes', 'Create and manage quotations', 50, 'FileText', false, true, 2),
  ('Invoices', 'invoices', 'Invoice generation and tracking', 50, 'Receipt', false, true, 3),
  ('Delivery Notes', 'delivery_notes', 'Delivery note management', 30, 'Truck', false, true, 4),
  ('Profitability', 'profitability', 'Job profitability tracking and analytics', 50, 'TrendingUp', false, true, 5),
  ('Task Management', 'tasks', 'Task and project management', 30, 'CheckSquare', false, true, 6),
  ('Tender Tracking', 'tenders', 'Tender and RFQ tracking', 30, 'Briefcase', false, true, 7),
  ('Accounting', 'accounting', 'Full accounting with bank accounts, expenses', 80, 'Calculator', false, true, 8),
  ('Staff & HR', 'staff', 'Staff management, payroll, payslips', 80, 'UserPlus', false, true, 9),
  ('Fleet Management', 'fleet', 'Vehicle tracking, maintenance, fuel logs', 100, 'Car', false, true, 10);
