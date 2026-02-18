
ALTER TABLE public.admin_invoices
ADD COLUMN email_sent_at timestamptz DEFAULT NULL,
ADD COLUMN email_sent_to text DEFAULT NULL;
