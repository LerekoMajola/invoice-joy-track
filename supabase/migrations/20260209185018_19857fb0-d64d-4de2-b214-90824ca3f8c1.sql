
-- Create legal_case_expenses table
CREATE TABLE public.legal_case_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL,
  description text NOT NULL,
  expense_type text NOT NULL DEFAULT 'other',
  is_billable boolean DEFAULT true,
  is_invoiced boolean DEFAULT false,
  invoice_id uuid REFERENCES public.invoices(id),
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_case_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own case expenses" ON public.legal_case_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own case expenses" ON public.legal_case_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own case expenses" ON public.legal_case_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own case expenses" ON public.legal_case_expenses FOR DELETE USING (auth.uid() = user_id);

-- Add category column to existing legal_case_notes table (it already exists but lacks a category column)
-- Actually, the table already exists with note_type. Let's just use it as-is.
