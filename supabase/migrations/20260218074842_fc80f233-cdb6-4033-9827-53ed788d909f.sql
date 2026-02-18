
-- Create gym_attendance table
CREATE TABLE public.gym_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_profile_id UUID REFERENCES public.company_profiles(id),
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_gym_attendance_user_id ON public.gym_attendance(user_id);
CREATE INDEX idx_gym_attendance_member_id ON public.gym_attendance(member_id);
CREATE INDEX idx_gym_attendance_check_in ON public.gym_attendance(check_in);
CREATE INDEX idx_gym_attendance_company ON public.gym_attendance(company_profile_id);

-- Enable RLS
ALTER TABLE public.gym_attendance ENABLE ROW LEVEL SECURITY;

-- Owner policies
CREATE POLICY "Owner can view gym attendance"
  ON public.gym_attendance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can insert gym attendance"
  ON public.gym_attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update gym attendance"
  ON public.gym_attendance FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can delete gym attendance"
  ON public.gym_attendance FOR DELETE
  USING (auth.uid() = user_id);

-- Staff policies
CREATE POLICY "Staff can view gym attendance"
  ON public.gym_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE staff_members.user_id = auth.uid()
        AND staff_members.owner_user_id = gym_attendance.user_id
    )
  );

CREATE POLICY "Staff can insert gym attendance"
  ON public.gym_attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE staff_members.user_id = auth.uid()
        AND staff_members.owner_user_id = gym_attendance.user_id
    )
  );

CREATE POLICY "Staff can update gym attendance"
  ON public.gym_attendance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE staff_members.user_id = auth.uid()
        AND staff_members.owner_user_id = gym_attendance.user_id
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_gym_attendance_updated_at
  BEFORE UPDATE ON public.gym_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
