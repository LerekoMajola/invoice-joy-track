
-- Create recurring_documents table
CREATE TABLE public.recurring_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('invoice', 'quote')),
  source_id UUID NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_run_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own recurring documents"
ON public.recurring_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring documents"
ON public.recurring_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring documents"
ON public.recurring_documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring documents"
ON public.recurring_documents FOR DELETE
USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_recurring_documents_updated_at
BEFORE UPDATE ON public.recurring_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
