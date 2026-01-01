-- Create table for multiple tax clearance documents
CREATE TABLE public.tax_clearance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_clearance_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own tax clearances" ON public.tax_clearance_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tax clearances" ON public.tax_clearance_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax clearances" ON public.tax_clearance_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax clearances" ON public.tax_clearance_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_tax_clearance_documents_updated_at
  BEFORE UPDATE ON public.tax_clearance_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();