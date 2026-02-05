-- Add new columns to leads table for enhanced CRM functionality
ALTER TABLE public.leads 
ADD COLUMN expected_close_date date,
ADD COLUMN win_probability integer DEFAULT 50 CHECK (win_probability >= 0 AND win_probability <= 100),
ADD COLUMN stage_entered_at timestamp with time zone DEFAULT now(),
ADD COLUMN last_contacted_at timestamp with time zone,
ADD COLUMN loss_reason text;

-- Create deal_stakeholders table to link multiple contacts to a deal
CREATE TABLE public.deal_stakeholders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  deal_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'contact',
  engagement_level text DEFAULT 'warm' CHECK (engagement_level IN ('hot', 'warm', 'cold')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(deal_id, contact_id)
);

-- Create deal_tasks table for deal-specific tasks
CREATE TABLE public.deal_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  deal_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.deal_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for deal_stakeholders
CREATE POLICY "Users can view their own deal stakeholders"
ON public.deal_stakeholders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deal stakeholders"
ON public.deal_stakeholders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deal stakeholders"
ON public.deal_stakeholders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deal stakeholders"
ON public.deal_stakeholders FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for deal_tasks
CREATE POLICY "Users can view their own deal tasks"
ON public.deal_tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deal tasks"
ON public.deal_tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deal tasks"
ON public.deal_tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deal tasks"
ON public.deal_tasks FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update stage_entered_at when status changes
CREATE OR REPLACE FUNCTION public.update_lead_stage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.stage_entered_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER lead_stage_change_trigger
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_lead_stage_timestamp();

-- Trigger to update updated_at on deal_stakeholders
CREATE TRIGGER update_deal_stakeholders_updated_at
BEFORE UPDATE ON public.deal_stakeholders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on deal_tasks
CREATE TRIGGER update_deal_tasks_updated_at
BEFORE UPDATE ON public.deal_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();