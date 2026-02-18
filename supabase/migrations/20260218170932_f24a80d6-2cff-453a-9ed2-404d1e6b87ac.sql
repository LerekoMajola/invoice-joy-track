
-- Create admin_invoices table for platform-level billing
CREATE TABLE public.admin_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_user_id uuid NOT NULL,
  company_profile_id uuid REFERENCES public.company_profiles(id),
  invoice_number text UNIQUE NOT NULL,
  company_name text NOT NULL,
  tenant_email text,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'LSL',
  status text NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL DEFAULT (CURRENT_DATE + interval '30 days')::date,
  payment_date date,
  payment_method text,
  payment_reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_invoices ENABLE ROW LEVEL SECURITY;

-- Only super_admin can do everything
CREATE POLICY "Super admins can manage admin invoices"
ON public.admin_invoices
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Trigger for updated_at
CREATE TRIGGER update_admin_invoices_updated_at
BEFORE UPDATE ON public.admin_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
