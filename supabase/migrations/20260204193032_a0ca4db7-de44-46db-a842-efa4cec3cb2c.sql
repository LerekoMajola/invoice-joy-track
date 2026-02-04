-- Extend staff_members table with profile fields
ALTER TABLE public.staff_members 
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS national_id TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Lesotho',
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
  ADD COLUMN IF NOT EXISTS hire_date DATE,
  ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'permanent',
  ADD COLUMN IF NOT EXISTS work_schedule TEXT DEFAULT 'full-time',
  ADD COLUMN IF NOT EXISTS probation_end_date DATE,
  ADD COLUMN IF NOT EXISTS salary_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'LSL',
  ADD COLUMN IF NOT EXISTS salary_frequency TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch_code TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create payslips table
CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  staff_member_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  payment_date DATE NOT NULL,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  overtime_rate NUMERIC DEFAULT 0,
  overtime_amount NUMERIC DEFAULT 0,
  allowances JSONB DEFAULT '[]',
  total_allowances NUMERIC DEFAULT 0,
  deductions JSONB DEFAULT '[]',
  total_deductions NUMERIC DEFAULT 0,
  gross_pay NUMERIC NOT NULL DEFAULT 0,
  net_pay NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on payslips
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- RLS: Owners can manage payslips
CREATE POLICY "Owners can manage payslips"
  ON public.payslips FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- RLS: Staff can view own payslips
CREATE POLICY "Staff can view own payslips"
  ON public.payslips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = payslips.staff_member_id
        AND sm.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at on payslips
CREATE TRIGGER update_payslips_updated_at
  BEFORE UPDATE ON public.payslips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create staff-assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('staff-assets', 'staff-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for staff-assets bucket
CREATE POLICY "Owners can manage staff assets"
  ON storage.objects FOR ALL
  USING (bucket_id = 'staff-assets' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'staff-assets' AND auth.uid()::text = (storage.foldername(name))[1]);