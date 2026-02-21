
DROP POLICY "Owners can insert portal notifications" ON public.portal_notifications;

CREATE POLICY "Authenticated users can insert portal notifications"
  ON public.portal_notifications FOR INSERT
  TO authenticated
  WITH CHECK (portal_user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.gym_members gm
    WHERE gm.id = member_id
    AND (gm.user_id = auth.uid() OR gm.owner_user_id = auth.uid())
  ));
