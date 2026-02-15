
-- Fleet Vehicles
CREATE TABLE public.fleet_vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vin TEXT,
  license_plate TEXT,
  license_expiry DATE,
  insurance_expiry DATE,
  odometer INTEGER DEFAULT 0,
  assigned_driver TEXT,
  purchase_price NUMERIC DEFAULT 0,
  finance_details TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  health_score INTEGER DEFAULT 100,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fleet vehicles" ON public.fleet_vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fleet vehicles" ON public.fleet_vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fleet vehicles" ON public.fleet_vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fleet vehicles" ON public.fleet_vehicles FOR DELETE USING (auth.uid() = user_id);

-- Fleet Service Logs
CREATE TABLE public.fleet_service_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  service_type TEXT NOT NULL DEFAULT 'general',
  provider TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  parts_replaced TEXT,
  invoice_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fleet_service_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fleet service logs" ON public.fleet_service_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fleet service logs" ON public.fleet_service_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fleet service logs" ON public.fleet_service_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fleet service logs" ON public.fleet_service_logs FOR DELETE USING (auth.uid() = user_id);

-- Fleet Fuel Logs
CREATE TABLE public.fleet_fuel_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  litres NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  odometer INTEGER,
  station TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fleet_fuel_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fleet fuel logs" ON public.fleet_fuel_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fleet fuel logs" ON public.fleet_fuel_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fleet fuel logs" ON public.fleet_fuel_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fleet fuel logs" ON public.fleet_fuel_logs FOR DELETE USING (auth.uid() = user_id);

-- Fleet Incidents
CREATE TABLE public.fleet_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  driver_name TEXT,
  incident_type TEXT NOT NULL DEFAULT 'other',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  cost NUMERIC DEFAULT 0,
  description TEXT,
  severity TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fleet_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fleet incidents" ON public.fleet_incidents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fleet incidents" ON public.fleet_incidents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fleet incidents" ON public.fleet_incidents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fleet incidents" ON public.fleet_incidents FOR DELETE USING (auth.uid() = user_id);

-- Fleet Tyres
CREATE TABLE public.fleet_tyres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  position TEXT NOT NULL DEFAULT 'front_left',
  brand TEXT,
  date_fitted DATE DEFAULT CURRENT_DATE,
  expected_km INTEGER DEFAULT 40000,
  current_km INTEGER DEFAULT 0,
  status TEXT DEFAULT 'good',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fleet_tyres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fleet tyres" ON public.fleet_tyres FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fleet tyres" ON public.fleet_tyres FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fleet tyres" ON public.fleet_tyres FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fleet tyres" ON public.fleet_tyres FOR DELETE USING (auth.uid() = user_id);

-- Fleet Documents
CREATE TABLE public.fleet_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT 'other',
  file_url TEXT NOT NULL,
  file_name TEXT,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fleet_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fleet documents" ON public.fleet_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fleet documents" ON public.fleet_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fleet documents" ON public.fleet_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fleet documents" ON public.fleet_documents FOR DELETE USING (auth.uid() = user_id);

-- Fleet Cost Entries
CREATE TABLE public.fleet_cost_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'other',
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fleet_cost_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fleet cost entries" ON public.fleet_cost_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fleet cost entries" ON public.fleet_cost_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fleet cost entries" ON public.fleet_cost_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fleet cost entries" ON public.fleet_cost_entries FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for fleet documents
INSERT INTO storage.buckets (id, name, public) VALUES ('fleet-documents', 'fleet-documents', false);

CREATE POLICY "Users can upload fleet documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fleet-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own fleet documents" ON storage.objects FOR SELECT USING (bucket_id = 'fleet-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own fleet documents" ON storage.objects FOR DELETE USING (bucket_id = 'fleet-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
