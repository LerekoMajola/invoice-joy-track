
-- Create job_cards table
CREATE TABLE public.job_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  job_card_number text NOT NULL,
  client_id uuid REFERENCES public.clients(id),
  client_name text NOT NULL,
  vehicle_reg text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year text,
  vehicle_vin text,
  vehicle_mileage text,
  vehicle_color text,
  reported_issue text,
  diagnosis text,
  recommended_work text,
  assigned_technician_id uuid REFERENCES public.staff_members(id),
  assigned_technician_name text,
  source_quote_id uuid REFERENCES public.quotes(id),
  invoice_id uuid REFERENCES public.invoices(id),
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'received',
  estimated_completion date,
  completed_at timestamp with time zone,
  tax_rate numeric NOT NULL DEFAULT 15,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_cards ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_cards
CREATE POLICY "Users can view their own job cards"
  ON public.job_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job cards"
  ON public.job_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job cards"
  ON public.job_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job cards"
  ON public.job_cards FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_job_cards_updated_at
  BEFORE UPDATE ON public.job_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create job_card_line_items table
CREATE TABLE public.job_card_line_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_card_id uuid NOT NULL REFERENCES public.job_cards(id) ON DELETE CASCADE,
  item_type text NOT NULL DEFAULT 'parts',
  description text NOT NULL,
  part_number text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_card_line_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_card_line_items (ownership via job_cards)
CREATE POLICY "Users can view their job card line items"
  ON public.job_card_line_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.job_cards
    WHERE job_cards.id = job_card_line_items.job_card_id
    AND job_cards.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their job card line items"
  ON public.job_card_line_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.job_cards
    WHERE job_cards.id = job_card_line_items.job_card_id
    AND job_cards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their job card line items"
  ON public.job_card_line_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.job_cards
    WHERE job_cards.id = job_card_line_items.job_card_id
    AND job_cards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their job card line items"
  ON public.job_card_line_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.job_cards
    WHERE job_cards.id = job_card_line_items.job_card_id
    AND job_cards.user_id = auth.uid()
  ));

-- Add source_job_card_id to quotes table
ALTER TABLE public.quotes ADD COLUMN source_job_card_id uuid REFERENCES public.job_cards(id);

-- Register workshop module
INSERT INTO public.platform_modules (name, key, description, icon, monthly_price, is_core, is_active, sort_order)
VALUES ('Workshop Management', 'workshop', 'Job cards, diagnosis, parts & labour tracking for vehicle workshops', 'Wrench', 80, false, true, 11);
