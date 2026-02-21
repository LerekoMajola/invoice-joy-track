
-- Add fitness_goal column to gym_members
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS fitness_goal text;

-- Create gym_workout_plans table
CREATE TABLE public.gym_workout_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  generated_at timestamptz NOT NULL DEFAULT now(),
  goal text NOT NULL,
  title text NOT NULL,
  duration_minutes integer NOT NULL,
  difficulty text NOT NULL,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  vitals_snapshot jsonb
);

-- Enable RLS
ALTER TABLE public.gym_workout_plans ENABLE ROW LEVEL SECURITY;

-- Members can read their own plans via owner_user_id on gym_members
CREATE POLICY "Members can view own workout plans"
  ON public.gym_workout_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_members gm
      WHERE gm.id = gym_workout_plans.member_id
      AND (gm.owner_user_id = auth.uid() OR gm.user_id = auth.uid())
    )
  );

-- Allow service role inserts (edge function uses service role)
-- No insert policy needed for anon/authenticated since edge function uses service role

-- Index for fast lookup by member + date
CREATE INDEX idx_gym_workout_plans_member_date ON public.gym_workout_plans (member_id, generated_at DESC);
