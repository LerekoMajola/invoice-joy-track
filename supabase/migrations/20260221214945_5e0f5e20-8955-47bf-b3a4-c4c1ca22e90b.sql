
CREATE TABLE public.gym_member_vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  weight_kg NUMERIC,
  height_cm NUMERIC,
  body_fat_pct NUMERIC,
  muscle_mass_kg NUMERIC,
  waist_cm NUMERIC,
  chest_cm NUMERIC,
  arm_cm NUMERIC,
  hip_cm NUMERIC,
  thigh_cm NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_member_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read own vitals"
ON public.gym_member_vitals
FOR SELECT
USING (
  member_id IN (
    SELECT id FROM public.gym_members WHERE portal_user_id = auth.uid()
  )
);

CREATE POLICY "Members can insert own vitals"
ON public.gym_member_vitals
FOR INSERT
WITH CHECK (
  member_id IN (
    SELECT id FROM public.gym_members WHERE portal_user_id = auth.uid()
  )
);

CREATE POLICY "Owners can read member vitals"
ON public.gym_member_vitals
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Owners can manage member vitals"
ON public.gym_member_vitals
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_gym_member_vitals_member_id ON public.gym_member_vitals(member_id);
CREATE INDEX idx_gym_member_vitals_logged_at ON public.gym_member_vitals(member_id, logged_at DESC);
