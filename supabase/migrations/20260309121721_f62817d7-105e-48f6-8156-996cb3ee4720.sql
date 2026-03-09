-- Allow staff to SELECT their owner's modules
CREATE POLICY "Staff can view owner modules"
ON public.user_modules FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_members sm
    WHERE sm.user_id = auth.uid()
      AND sm.owner_user_id = user_modules.user_id
      AND sm.status = 'active'
  )
);