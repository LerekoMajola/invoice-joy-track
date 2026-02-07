
-- Create staff_module_access junction table
CREATE TABLE public.staff_module_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_member_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.platform_modules(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(staff_member_id, module_id)
);

-- Enable RLS
ALTER TABLE public.staff_module_access ENABLE ROW LEVEL SECURITY;

-- Owners can manage module access for their own staff
CREATE POLICY "Owners can manage staff module access"
  ON public.staff_module_access
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = staff_module_access.staff_member_id
        AND sm.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = staff_module_access.staff_member_id
        AND sm.owner_user_id = auth.uid()
    )
  );

-- Staff can view their own module access
CREATE POLICY "Staff can view own module access"
  ON public.staff_module_access
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = staff_module_access.staff_member_id
        AND sm.user_id = auth.uid()
    )
  );
