
ALTER TABLE public.admin_invoices DROP CONSTRAINT IF EXISTS admin_invoices_company_profile_id_fkey;
ALTER TABLE public.admin_invoices ADD CONSTRAINT admin_invoices_company_profile_id_fkey FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id) ON DELETE SET NULL;
