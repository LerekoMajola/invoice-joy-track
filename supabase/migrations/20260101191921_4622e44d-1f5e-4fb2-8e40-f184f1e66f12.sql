-- Create leads table
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  company text,
  email text,
  phone text,
  source text,
  estimated_value numeric,
  status text NOT NULL DEFAULT 'new',
  priority text DEFAULT 'medium',
  next_follow_up date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lead_activities table for progress tracking
CREATE TABLE public.lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Enable RLS on lead_activities
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for leads
CREATE POLICY "Users can view their own leads"
ON public.leads
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads"
ON public.leads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
ON public.leads
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
ON public.leads
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for lead_activities
CREATE POLICY "Users can view their lead activities"
ON public.lead_activities
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.leads
  WHERE leads.id = lead_activities.lead_id
  AND leads.user_id = auth.uid()
));

CREATE POLICY "Users can create their lead activities"
ON public.lead_activities
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.leads
  WHERE leads.id = lead_activities.lead_id
  AND leads.user_id = auth.uid()
));

CREATE POLICY "Users can update their lead activities"
ON public.lead_activities
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.leads
  WHERE leads.id = lead_activities.lead_id
  AND leads.user_id = auth.uid()
));

CREATE POLICY "Users can delete their lead activities"
ON public.lead_activities
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.leads
  WHERE leads.id = lead_activities.lead_id
  AND leads.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();