
-- Create admin_prospects table
CREATE TABLE public.admin_prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  contact_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead','contacted','demo','proposal','negotiation','won','lost')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  estimated_value NUMERIC DEFAULT 0,
  expected_close_date DATE,
  win_probability INT DEFAULT 5 CHECK (win_probability >= 0 AND win_probability <= 100),
  source TEXT,
  notes TEXT,
  next_follow_up DATE,
  stage_entered_at TIMESTAMPTZ DEFAULT now(),
  loss_reason TEXT,
  interested_plan TEXT,
  interested_system TEXT
);

-- Create admin_prospect_activities table
CREATE TABLE public.admin_prospect_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  prospect_id UUID NOT NULL REFERENCES public.admin_prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('note','call','email','demo','meeting')),
  title TEXT NOT NULL,
  description TEXT
);

-- Enable RLS
ALTER TABLE public.admin_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_prospect_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies — super_admin only via existing has_role() security definer
CREATE POLICY "Super admins only on prospects"
  ON public.admin_prospects
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins only on prospect activities"
  ON public.admin_prospect_activities
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- updated_at trigger
CREATE TRIGGER update_admin_prospects_updated_at
  BEFORE UPDATE ON public.admin_prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-set win_probability when status changes
CREATE OR REPLACE FUNCTION public.update_prospect_stage_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.stage_entered_at = now();
    -- Set default win probability per stage
    CASE NEW.status
      WHEN 'lead'        THEN NEW.win_probability = COALESCE(NEW.win_probability, 5);
      WHEN 'contacted'   THEN NEW.win_probability = COALESCE(NEW.win_probability, 15);
      WHEN 'demo'        THEN NEW.win_probability = COALESCE(NEW.win_probability, 35);
      WHEN 'proposal'    THEN NEW.win_probability = COALESCE(NEW.win_probability, 55);
      WHEN 'negotiation' THEN NEW.win_probability = COALESCE(NEW.win_probability, 75);
      WHEN 'won'         THEN NEW.win_probability = 100;
      WHEN 'lost'        THEN NEW.win_probability = 0;
      ELSE NULL;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_prospect_stage_on_status_change
  BEFORE UPDATE ON public.admin_prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prospect_stage_defaults();
