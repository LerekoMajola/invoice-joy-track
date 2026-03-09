-- 1. Create the can_access_company_data function
CREATE OR REPLACE FUNCTION public.can_access_company_data(_company_profile_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_profiles
    WHERE id = _company_profile_id AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM staff_members sm
    JOIN company_profiles cp ON cp.user_id = sm.owner_user_id
    WHERE sm.user_id = auth.uid()
      AND sm.status = 'active'
      AND cp.id = _company_profile_id
  )
$$;

-- 2. Staff can SELECT company_profiles they belong to
CREATE POLICY "Staff can view their company profile"
ON public.company_profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_members sm
    WHERE sm.user_id = auth.uid()
      AND sm.owner_user_id = company_profiles.user_id
      AND sm.status = 'active'
  )
);

-- 3. Add staff-aware policies on core business tables

-- quotes
CREATE POLICY "Staff can access company quotes"
ON public.quotes FOR ALL TO authenticated
USING (can_access_company_data(company_profile_id))
WITH CHECK (can_access_company_data(company_profile_id));

-- clients
CREATE POLICY "Staff can access company clients"
ON public.clients FOR ALL TO authenticated
USING (can_access_company_data(company_profile_id))
WITH CHECK (can_access_company_data(company_profile_id));

-- invoices
CREATE POLICY "Staff can access company invoices"
ON public.invoices FOR ALL TO authenticated
USING (can_access_company_data(company_profile_id))
WITH CHECK (can_access_company_data(company_profile_id));

-- delivery_notes
CREATE POLICY "Staff can access company delivery notes"
ON public.delivery_notes FOR ALL TO authenticated
USING (can_access_company_data(company_profile_id))
WITH CHECK (can_access_company_data(company_profile_id));

-- tasks
CREATE POLICY "Staff can access company tasks"
ON public.tasks FOR ALL TO authenticated
USING (can_access_company_data(company_profile_id))
WITH CHECK (can_access_company_data(company_profile_id));

-- leads
CREATE POLICY "Staff can access company leads"
ON public.leads FOR ALL TO authenticated
USING (can_access_company_data(company_profile_id))
WITH CHECK (can_access_company_data(company_profile_id));

-- contacts
CREATE POLICY "Staff can access company contacts"
ON public.contacts FOR ALL TO authenticated
USING (can_access_company_data(company_profile_id))
WITH CHECK (can_access_company_data(company_profile_id));

-- client_documents
CREATE POLICY "Staff can access company client documents"
ON public.client_documents FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_documents.client_id
      AND can_access_company_data(c.company_profile_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_documents.client_id
      AND can_access_company_data(c.company_profile_id)
  )
);

-- quote_line_items
CREATE POLICY "Staff can access company quote line items"
ON public.quote_line_items FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quotes q
    WHERE q.id = quote_line_items.quote_id
      AND can_access_company_data(q.company_profile_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quotes q
    WHERE q.id = quote_line_items.quote_id
      AND can_access_company_data(q.company_profile_id)
  )
);

-- invoice_line_items
CREATE POLICY "Staff can access company invoice line items"
ON public.invoice_line_items FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_line_items.invoice_id
      AND can_access_company_data(i.company_profile_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_line_items.invoice_id
      AND can_access_company_data(i.company_profile_id)
  )
);