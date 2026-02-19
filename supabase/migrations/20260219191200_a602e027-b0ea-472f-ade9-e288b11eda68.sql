-- Portal member can INSERT their own check-in
CREATE POLICY "Portal: gym member can check in"
  ON public.gym_attendance FOR INSERT TO authenticated
  WITH CHECK (
    member_id IN (
      SELECT id FROM public.gym_members
      WHERE portal_user_id = auth.uid()
    )
  );

-- Portal member can SELECT their own attendance history
CREATE POLICY "Portal: gym member can view own attendance"
  ON public.gym_attendance FOR SELECT TO authenticated
  USING (
    member_id IN (
      SELECT id FROM public.gym_members
      WHERE portal_user_id = auth.uid()
    )
  );