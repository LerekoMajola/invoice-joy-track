
-- 1. Update system_type constraint to include 'hire'
ALTER TABLE public.subscriptions
  DROP CONSTRAINT subscriptions_system_type_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_system_type_check
  CHECK (system_type = ANY (ARRAY['business', 'workshop', 'school', 'legal', 'hire']));

-- 2. Create equipment_items table
CREATE TABLE public.equipment_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  description text,
  serial_number text,
  daily_rate numeric NOT NULL DEFAULT 0,
  weekly_rate numeric,
  monthly_rate numeric,
  deposit_amount numeric NOT NULL DEFAULT 0,
  condition text NOT NULL DEFAULT 'good',
  status text NOT NULL DEFAULT 'available',
  image_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own equipment" ON public.equipment_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own equipment" ON public.equipment_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own equipment" ON public.equipment_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own equipment" ON public.equipment_items FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_equipment_items_updated_at BEFORE UPDATE ON public.equipment_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Create hire_orders table
CREATE TABLE public.hire_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  order_number text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text,
  hire_start date NOT NULL,
  hire_end date NOT NULL,
  actual_return_date date,
  status text NOT NULL DEFAULT 'draft',
  deposit_paid numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hire_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hire orders" ON public.hire_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own hire orders" ON public.hire_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hire orders" ON public.hire_orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hire orders" ON public.hire_orders FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_hire_orders_updated_at BEFORE UPDATE ON public.hire_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Create hire_order_items table
CREATE TABLE public.hire_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hire_order_id uuid NOT NULL REFERENCES public.hire_orders(id) ON DELETE CASCADE,
  equipment_item_id uuid REFERENCES public.equipment_items(id) ON DELETE SET NULL,
  equipment_name text NOT NULL,
  daily_rate numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  subtotal numeric NOT NULL DEFAULT 0,
  condition_out text,
  condition_in text,
  damage_notes text,
  damage_charge numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hire_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hire order items" ON public.hire_order_items FOR SELECT USING (EXISTS (SELECT 1 FROM hire_orders WHERE hire_orders.id = hire_order_items.hire_order_id AND hire_orders.user_id = auth.uid()));
CREATE POLICY "Users can create own hire order items" ON public.hire_order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM hire_orders WHERE hire_orders.id = hire_order_items.hire_order_id AND hire_orders.user_id = auth.uid()));
CREATE POLICY "Users can update own hire order items" ON public.hire_order_items FOR UPDATE USING (EXISTS (SELECT 1 FROM hire_orders WHERE hire_orders.id = hire_order_items.hire_order_id AND hire_orders.user_id = auth.uid()));
CREATE POLICY "Users can delete own hire order items" ON public.hire_order_items FOR DELETE USING (EXISTS (SELECT 1 FROM hire_orders WHERE hire_orders.id = hire_order_items.hire_order_id AND hire_orders.user_id = auth.uid()));

-- 5. Storage bucket for equipment photos
INSERT INTO storage.buckets (id, name, public) VALUES ('hire-assets', 'hire-assets', true);

CREATE POLICY "Anyone can view hire assets" ON storage.objects FOR SELECT USING (bucket_id = 'hire-assets');
CREATE POLICY "Users can upload hire assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hire-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update hire assets" ON storage.objects FOR UPDATE USING (bucket_id = 'hire-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete hire assets" ON storage.objects FOR DELETE USING (bucket_id = 'hire-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Seed platform modules for hire
INSERT INTO public.platform_modules (name, key, description, icon, system_type, is_core, monthly_price, sort_order) VALUES
  ('Equipment Catalogue', 'hire_equipment', 'Manage your tool and equipment inventory with rates and availability', 'package', 'hire', true, 0, 1),
  ('Hire Orders', 'hire_orders', 'Create and manage rental agreements and bookings', 'clipboard-list', 'hire', false, 100, 2),
  ('Availability Calendar', 'hire_calendar', 'Visual calendar showing equipment bookings and availability', 'calendar', 'hire', false, 100, 3),
  ('Returns & Tracking', 'hire_returns', 'Track returns, condition reports, and damage charges', 'rotate-ccw', 'hire', false, 100, 4);
