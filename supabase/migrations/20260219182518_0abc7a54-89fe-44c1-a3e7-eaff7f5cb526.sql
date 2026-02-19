
-- Portal: gym member reads their own record
CREATE POLICY "Portal: gym member reads own record"
  ON public.gym_members FOR SELECT TO authenticated
  USING (portal_user_id = auth.uid());

-- Portal: gym member reads their own subscriptions
CREATE POLICY "Portal: gym member reads own subscriptions"
  ON public.gym_member_subscriptions FOR SELECT TO authenticated
  USING (member_id IN (
    SELECT id FROM public.gym_members WHERE portal_user_id = auth.uid()
  ));

-- Portal: gym member reads class schedules for their gym
CREATE POLICY "Portal: gym member reads class schedules"
  ON public.gym_class_schedules FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT owner_user_id FROM public.gym_members WHERE portal_user_id = auth.uid()
  ));

-- Portal: gym member reads gym classes for their gym
CREATE POLICY "Portal: gym member reads gym classes"
  ON public.gym_classes FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT owner_user_id FROM public.gym_members WHERE portal_user_id = auth.uid()
  ));

-- Portal: gym member reads membership plans for their gym
CREATE POLICY "Portal: gym member reads membership plans"
  ON public.gym_membership_plans FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT owner_user_id FROM public.gym_members WHERE portal_user_id = auth.uid()
  ));
