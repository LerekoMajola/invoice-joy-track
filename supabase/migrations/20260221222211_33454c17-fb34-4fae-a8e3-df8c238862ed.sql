CREATE POLICY "Portal: member updates own fitness_goal"
  ON public.gym_members
  FOR UPDATE
  USING (portal_user_id = auth.uid())
  WITH CHECK (portal_user_id = auth.uid());