
ALTER TABLE public.job_cards DROP CONSTRAINT IF EXISTS job_cards_client_id_fkey;
ALTER TABLE public.job_cards ADD CONSTRAINT job_cards_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE public.job_cards DROP CONSTRAINT IF EXISTS job_cards_invoice_id_fkey;
ALTER TABLE public.job_cards ADD CONSTRAINT job_cards_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;

ALTER TABLE public.job_cards DROP CONSTRAINT IF EXISTS job_cards_source_quote_id_fkey;
ALTER TABLE public.job_cards ADD CONSTRAINT job_cards_source_quote_id_fkey FOREIGN KEY (source_quote_id) REFERENCES public.quotes(id) ON DELETE SET NULL;

ALTER TABLE public.job_cards DROP CONSTRAINT IF EXISTS job_cards_assigned_technician_id_fkey;
ALTER TABLE public.job_cards ADD CONSTRAINT job_cards_assigned_technician_id_fkey FOREIGN KEY (assigned_technician_id) REFERENCES public.staff_members(id) ON DELETE SET NULL;

ALTER TABLE public.legal_case_expenses DROP CONSTRAINT IF EXISTS legal_case_expenses_invoice_id_fkey;
ALTER TABLE public.legal_case_expenses ADD CONSTRAINT legal_case_expenses_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;
