-- Create tender_source_links table
CREATE TABLE public.tender_source_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tender_source_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own tender source links"
ON public.tender_source_links
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tender source links"
ON public.tender_source_links
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tender source links"
ON public.tender_source_links
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tender source links"
ON public.tender_source_links
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tender_source_links_updated_at
BEFORE UPDATE ON public.tender_source_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();