
CREATE POLICY "Admins can delete subscriptions"
  ON public.subscriptions FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete company profiles"
  ON public.company_profiles FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));
