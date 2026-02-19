
-- equipment_service_logs
CREATE TABLE public.equipment_service_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  equipment_item_id UUID NOT NULL REFERENCES equipment_items(id) ON DELETE CASCADE,
  company_profile_id UUID REFERENCES company_profiles(id),
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  service_type TEXT NOT NULL DEFAULT 'repair',
  provider TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  parts_replaced TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment_service_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own equipment service logs"
  ON public.equipment_service_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment service logs"
  ON public.equipment_service_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment service logs"
  ON public.equipment_service_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment service logs"
  ON public.equipment_service_logs FOR DELETE
  USING (auth.uid() = user_id);

-- equipment_incidents
CREATE TABLE public.equipment_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  equipment_item_id UUID NOT NULL REFERENCES equipment_items(id) ON DELETE CASCADE,
  company_profile_id UUID REFERENCES company_profiles(id),
  incident_type TEXT NOT NULL DEFAULT 'damage',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  severity TEXT NOT NULL DEFAULT 'minor',
  description TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  resolved BOOLEAN NOT NULL DEFAULT false,
  photo_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own equipment incidents"
  ON public.equipment_incidents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment incidents"
  ON public.equipment_incidents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment incidents"
  ON public.equipment_incidents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment incidents"
  ON public.equipment_incidents FOR DELETE
  USING (auth.uid() = user_id);
