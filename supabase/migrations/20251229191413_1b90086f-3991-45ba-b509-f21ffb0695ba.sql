-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  quote_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  date DATE NOT NULL,
  valid_until DATE NOT NULL,
  total NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  tax_rate NUMERIC(5,2) DEFAULT 15,
  terms_and_conditions TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quote_line_items table
CREATE TABLE public.quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  source_quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT,
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  total NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 15,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  purchase_order_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invoice_line_items table
CREATE TABLE public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create delivery_notes table
CREATE TABLE public.delivery_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  note_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  date DATE NOT NULL,
  delivery_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create delivery_note_items table
CREATE TABLE public.delivery_note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_note_id UUID NOT NULL REFERENCES public.delivery_notes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_note_items ENABLE ROW LEVEL SECURITY;

-- Clients RLS policies
CREATE POLICY "Users can view their own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Quotes RLS policies
CREATE POLICY "Users can view their own quotes" ON public.quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quotes" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quotes" ON public.quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quotes" ON public.quotes FOR DELETE USING (auth.uid() = user_id);

-- Quote line items RLS policies (via quote ownership)
CREATE POLICY "Users can view their quote line items" ON public.quote_line_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_line_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can create their quote line items" ON public.quote_line_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_line_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can update their quote line items" ON public.quote_line_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_line_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can delete their quote line items" ON public.quote_line_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_line_items.quote_id AND quotes.user_id = auth.uid()));

-- Invoices RLS policies
CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invoices" ON public.invoices FOR DELETE USING (auth.uid() = user_id);

-- Invoice line items RLS policies (via invoice ownership)
CREATE POLICY "Users can view their invoice line items" ON public.invoice_line_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Users can create their invoice line items" ON public.invoice_line_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Users can update their invoice line items" ON public.invoice_line_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Users can delete their invoice line items" ON public.invoice_line_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.user_id = auth.uid()));

-- Delivery notes RLS policies
CREATE POLICY "Users can view their own delivery notes" ON public.delivery_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own delivery notes" ON public.delivery_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own delivery notes" ON public.delivery_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own delivery notes" ON public.delivery_notes FOR DELETE USING (auth.uid() = user_id);

-- Delivery note items RLS policies (via delivery note ownership)
CREATE POLICY "Users can view their delivery note items" ON public.delivery_note_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.delivery_notes WHERE delivery_notes.id = delivery_note_items.delivery_note_id AND delivery_notes.user_id = auth.uid()));
CREATE POLICY "Users can create their delivery note items" ON public.delivery_note_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.delivery_notes WHERE delivery_notes.id = delivery_note_items.delivery_note_id AND delivery_notes.user_id = auth.uid()));
CREATE POLICY "Users can update their delivery note items" ON public.delivery_note_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.delivery_notes WHERE delivery_notes.id = delivery_note_items.delivery_note_id AND delivery_notes.user_id = auth.uid()));
CREATE POLICY "Users can delete their delivery note items" ON public.delivery_note_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.delivery_notes WHERE delivery_notes.id = delivery_note_items.delivery_note_id AND delivery_notes.user_id = auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_notes_updated_at BEFORE UPDATE ON public.delivery_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();