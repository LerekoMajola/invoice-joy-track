-- Fix: allow portal users to SELECT their own workout plans
DROP POLICY IF EXISTS "Members can view own workout plans" ON public.gym_workout_plans;

CREATE POLICY "Members can view own workout plans"
  ON public.gym_workout_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gym_members gm
      WHERE gm.id = gym_workout_plans.member_id
        AND (gm.owner_user_id = auth.uid() OR gm.user_id = auth.uid() OR gm.portal_user_id = auth.uid())
    )
  );