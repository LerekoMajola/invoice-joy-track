
-- Add INSERT policy for super_admin on user_modules
CREATE POLICY "Admins can insert user modules"
ON public.user_modules
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Add DELETE policy for super_admin on user_modules
CREATE POLICY "Admins can delete user modules"
ON public.user_modules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));
