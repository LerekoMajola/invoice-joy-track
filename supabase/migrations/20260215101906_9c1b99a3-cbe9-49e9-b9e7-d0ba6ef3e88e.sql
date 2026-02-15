
-- ============================================
-- Fleet Management System - Full Schema Build
-- ============================================

-- 1. New table: fleet_maintenance_schedules
CREATE TABLE public.fleet_maintenance_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL DEFAULT 'General Service',
  interval_km INTEGER,
  interval_months INTEGER,
  last_completed_date DATE,
  last_completed_odometer INTEGER,
  next_due_date DATE,
  next_due_odometer INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fleet_maintenance_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own maintenance schedules" ON public.fleet_maintenance_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own maintenance schedules" ON public.fleet_maintenance_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own maintenance schedules" ON public.fleet_maintenance_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own maintenance schedules" ON public.fleet_maintenance_schedules FOR DELETE USING (auth.uid() = user_id);

-- 2. New table: fleet_drivers
CREATE TABLE public.fleet_drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  license_expiry DATE,
  license_type TEXT DEFAULT 'B',
  risk_score INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fleet_drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fleet drivers" ON public.fleet_drivers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fleet drivers" ON public.fleet_drivers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fleet drivers" ON public.fleet_drivers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fleet drivers" ON public.fleet_drivers FOR DELETE USING (auth.uid() = user_id);

-- 3. Add columns to fleet_vehicles
ALTER TABLE public.fleet_vehicles
  ADD COLUMN IF NOT EXISTS warranty_expiry DATE,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS fuel_type TEXT DEFAULT 'diesel',
  ADD COLUMN IF NOT EXISTS engine_size TEXT,
  ADD COLUMN IF NOT EXISTS disposed_at DATE;

-- 4. Add columns to fleet_incidents
ALTER TABLE public.fleet_incidents
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[],
  ADD COLUMN IF NOT EXISTS insurance_claim_ref TEXT,
  ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT false;

-- 5. Add columns to fleet_tyres
ALTER TABLE public.fleet_tyres
  ADD COLUMN IF NOT EXISTS cost NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rotation_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_rotation_date DATE,
  ADD COLUMN IF NOT EXISTS replacement_date DATE,
  ADD COLUMN IF NOT EXISTS size TEXT;

-- 6. Add column to fleet_cost_entries
ALTER TABLE public.fleet_cost_entries
  ADD COLUMN IF NOT EXISTS vendor TEXT;

-- 7. Create storage bucket for fleet documents (bucket only, policies already exist)
INSERT INTO storage.buckets (id, name, public) VALUES ('fleet-documents', 'fleet-documents', false)
ON CONFLICT (id) DO NOTHING;
