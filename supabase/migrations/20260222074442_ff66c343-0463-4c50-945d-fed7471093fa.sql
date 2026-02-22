
-- Create package_tiers table
CREATE TABLE public.package_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_type text NOT NULL,
  name text NOT NULL,
  display_name text NOT NULL,
  description text,
  bundle_price numeric NOT NULL DEFAULT 0,
  module_keys text[] NOT NULL DEFAULT '{}',
  features jsonb NOT NULL DEFAULT '[]',
  is_popular boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add package_tier_id to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN package_tier_id uuid REFERENCES public.package_tiers(id);

-- Enable RLS
ALTER TABLE public.package_tiers ENABLE ROW LEVEL SECURITY;

-- Public read for landing/signup
CREATE POLICY "Package tiers are publicly readable"
  ON public.package_tiers FOR SELECT
  USING (true);

-- Admin write via super_admin role
CREATE POLICY "Admins can manage package tiers"
  ON public.package_tiers FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Updated_at trigger
CREATE TRIGGER update_package_tiers_updated_at
  BEFORE UPDATE ON public.package_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed all 24 tiers

-- Business
INSERT INTO public.package_tiers (system_type, name, display_name, description, bundle_price, module_keys, features, is_popular, sort_order) VALUES
('business', 'Starter', 'BizPro Starter', 'Freelancers & sole traders', 350, ARRAY['quotes','invoices','tasks','staff'],
 '[{"name":"Quotes & Estimates","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"CRM & Leads","included":false},{"name":"Accounting","included":false},{"name":"Tenders","included":false},{"name":"Delivery Notes","included":false}]'::jsonb, false, 1),
('business', 'Professional', 'BizPro Professional', 'Growing businesses', 550, ARRAY['quotes','invoices','crm','tasks','staff','accounting'],
 '[{"name":"Quotes & Estimates","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"CRM & Leads","included":true},{"name":"Accounting","included":true},{"name":"Tenders","included":false},{"name":"Delivery Notes","included":false}]'::jsonb, true, 2),
('business', 'Enterprise', 'BizPro Enterprise', 'Established companies', 800, ARRAY['quotes','invoices','crm','tasks','staff','accounting','tenders','delivery_notes'],
 '[{"name":"Quotes & Estimates","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"CRM & Leads","included":true},{"name":"Accounting","included":true},{"name":"Tenders","included":true},{"name":"Delivery Notes","included":true}]'::jsonb, false, 3);

-- Workshop
INSERT INTO public.package_tiers (system_type, name, display_name, description, bundle_price, module_keys, features, is_popular, sort_order) VALUES
('workshop', 'Starter', 'ShopPro Starter', 'Small repair shops', 450, ARRAY['workshop','invoices','tasks','staff'],
 '[{"name":"Workshop & Job Cards","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Accounting","included":false},{"name":"Fleet Management","included":false}]'::jsonb, false, 1),
('workshop', 'Professional', 'ShopPro Professional', 'Mid-size workshops', 650, ARRAY['workshop','invoices','tasks','staff','accounting'],
 '[{"name":"Workshop & Job Cards","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Accounting","included":true},{"name":"Fleet Management","included":false}]'::jsonb, true, 2),
('workshop', 'Enterprise', 'ShopPro Enterprise', 'Large service centres', 900, ARRAY['workshop','invoices','tasks','staff','accounting','fleet'],
 '[{"name":"Workshop & Job Cards","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Accounting","included":true},{"name":"Fleet Management","included":true}]'::jsonb, false, 3);

-- School
INSERT INTO public.package_tiers (system_type, name, display_name, description, bundle_price, module_keys, features, is_popular, sort_order) VALUES
('school', 'Starter', 'EduPro Starter', 'Small private schools', 720, ARRAY['school_admin','students','school_fees','invoices','tasks','staff'],
 '[{"name":"School Admin","included":true},{"name":"Student Management","included":true},{"name":"School Fees","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Accounting","included":false}]'::jsonb, false, 1),
('school', 'Professional', 'EduPro Professional', 'Mid-size academies', 950, ARRAY['school_admin','students','school_fees','invoices','tasks','staff','accounting'],
 '[{"name":"School Admin","included":true},{"name":"Student Management","included":true},{"name":"School Fees","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Accounting","included":true}]'::jsonb, true, 2),
('school', 'Enterprise', 'EduPro Enterprise', 'Large schools & campuses', 1200, ARRAY['school_admin','students','school_fees','invoices','tasks','staff','accounting'],
 '[{"name":"School Admin","included":true},{"name":"Student Management","included":true},{"name":"School Fees","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Accounting","included":true}]'::jsonb, false, 3);

-- Legal
INSERT INTO public.package_tiers (system_type, name, display_name, description, bundle_price, module_keys, features, is_popular, sort_order) VALUES
('legal', 'Starter', 'LawPro Starter', 'Solo practitioners', 500, ARRAY['legal_cases','invoices','tasks','staff'],
 '[{"name":"Cases & Matters","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Billing & Time Tracking","included":false},{"name":"Accounting","included":false},{"name":"Document Management","included":false},{"name":"Court Calendar","included":false}]'::jsonb, false, 1),
('legal', 'Professional', 'LawPro Professional', 'Growing law firms', 700, ARRAY['legal_cases','legal_billing','legal_documents','invoices','tasks','staff','accounting'],
 '[{"name":"Cases & Matters","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Billing & Time Tracking","included":true},{"name":"Accounting","included":true},{"name":"Document Management","included":true},{"name":"Court Calendar","included":false}]'::jsonb, true, 2),
('legal', 'Enterprise', 'LawPro Enterprise', 'Established firms', 950, ARRAY['legal_cases','legal_billing','legal_documents','legal_calendar','invoices','tasks','staff','accounting','core_crm'],
 '[{"name":"Cases & Matters","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Billing & Time Tracking","included":true},{"name":"Accounting","included":true},{"name":"Document Management","included":true},{"name":"Court Calendar","included":true}]'::jsonb, false, 3);

-- Hire
INSERT INTO public.package_tiers (system_type, name, display_name, description, bundle_price, module_keys, features, is_popular, sort_order) VALUES
('hire', 'Starter', 'HirePro Starter', 'Small rental shops', 400, ARRAY['hire_equipment','invoices','tasks','staff'],
 '[{"name":"Equipment Catalogue","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Hire Orders","included":false},{"name":"Accounting","included":false},{"name":"Availability Calendar","included":false},{"name":"Returns & Tracking","included":false}]'::jsonb, false, 1),
('hire', 'Professional', 'HirePro Professional', 'Growing rental businesses', 600, ARRAY['hire_equipment','hire_orders','invoices','tasks','staff','accounting'],
 '[{"name":"Equipment Catalogue","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Hire Orders","included":true},{"name":"Accounting","included":true},{"name":"Availability Calendar","included":false},{"name":"Returns & Tracking","included":false}]'::jsonb, true, 2),
('hire', 'Enterprise', 'HirePro Enterprise', 'Large hire companies', 850, ARRAY['hire_equipment','hire_orders','hire_calendar','hire_returns','invoices','tasks','staff','accounting','core_crm'],
 '[{"name":"Equipment Catalogue","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Hire Orders","included":true},{"name":"Accounting","included":true},{"name":"Availability Calendar","included":true},{"name":"Returns & Tracking","included":true}]'::jsonb, false, 3);

-- Guesthouse
INSERT INTO public.package_tiers (system_type, name, display_name, description, bundle_price, module_keys, features, is_popular, sort_order) VALUES
('guesthouse', 'Starter', 'StayPro Starter', 'Small guest houses', 650, ARRAY['gh_rooms','gh_bookings','invoices','tasks','staff'],
 '[{"name":"Room Management","included":true},{"name":"Bookings & Calendar","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Housekeeping","included":false},{"name":"Accounting","included":false},{"name":"Guest Reviews","included":false}]'::jsonb, false, 1),
('guesthouse', 'Professional', 'StayPro Professional', 'Growing lodges', 850, ARRAY['gh_rooms','gh_bookings','gh_housekeeping','invoices','tasks','staff','accounting','gh_reviews'],
 '[{"name":"Room Management","included":true},{"name":"Bookings & Calendar","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Housekeeping","included":true},{"name":"Accounting","included":true},{"name":"Guest Reviews","included":true}]'::jsonb, true, 2),
('guesthouse', 'Enterprise', 'StayPro Enterprise', 'Established hospitality', 1100, ARRAY['gh_rooms','gh_bookings','gh_housekeeping','gh_reviews','invoices','tasks','staff','accounting','core_crm'],
 '[{"name":"Room Management","included":true},{"name":"Bookings & Calendar","included":true},{"name":"Invoices","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Housekeeping","included":true},{"name":"Accounting","included":true},{"name":"Guest Reviews","included":true}]'::jsonb, false, 3);

-- Fleet
INSERT INTO public.package_tiers (system_type, name, display_name, description, bundle_price, module_keys, features, is_popular, sort_order) VALUES
('fleet', 'Starter', 'FleetPro Starter', 'Small fleets (up to 15 vehicles)', 500, ARRAY['fleet','invoices','tasks','staff'],
 '[{"name":"Fleet Overview & Dashboard","included":true},{"name":"Vehicle Registry","included":true},{"name":"Service History & Logging","included":true},{"name":"Fuel Cost Entry","included":true},{"name":"Invoices","included":true},{"name":"Staff & HR","included":true},{"name":"Maintenance Scheduling","included":false},{"name":"Cost Intelligence","included":false},{"name":"Tyre Management","included":false},{"name":"Driver Risk Scoring","included":false}]'::jsonb, false, 1),
('fleet', 'Professional', 'FleetPro Professional', 'Growing fleets', 700, ARRAY['fleet','fleet_maintenance','fleet_costs','invoices','tasks','staff','accounting'],
 '[{"name":"Fleet Overview & Dashboard","included":true},{"name":"Vehicle Registry","included":true},{"name":"Service History & Logging","included":true},{"name":"Fuel Cost Entry","included":true},{"name":"Invoices","included":true},{"name":"Staff & HR","included":true},{"name":"Maintenance Scheduling","included":true},{"name":"Cost Intelligence","included":true},{"name":"Tyre Management","included":false},{"name":"Driver Risk Scoring","included":false}]'::jsonb, true, 2),
('fleet', 'Enterprise', 'FleetPro Enterprise', 'Large fleets (50+ vehicles)', 950, ARRAY['fleet','fleet_maintenance','fleet_costs','fleet_tyres','fleet_drivers','fleet_reports','fleet_documents','invoices','tasks','staff','accounting','core_crm'],
 '[{"name":"Fleet Overview & Dashboard","included":true},{"name":"Vehicle Registry","included":true},{"name":"Service History & Logging","included":true},{"name":"Fuel Cost Entry","included":true},{"name":"Invoices","included":true},{"name":"Staff & HR","included":true},{"name":"Maintenance Scheduling","included":true},{"name":"Cost Intelligence","included":true},{"name":"Tyre Management","included":true},{"name":"Driver Risk Scoring","included":true}]'::jsonb, false, 3);

-- Gym
INSERT INTO public.package_tiers (system_type, name, display_name, description, bundle_price, module_keys, features, is_popular, sort_order) VALUES
('gym', 'Starter', 'GymPro Starter', 'Small gyms & studios', 500, ARRAY['gym_members','gym_billing','invoices','tasks','staff'],
 '[{"name":"Members & Subscriptions","included":true},{"name":"Invoices","included":true},{"name":"Payment & Billing","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Class Scheduling","included":false},{"name":"Attendance Tracking","included":false},{"name":"Accounting","included":false}]'::jsonb, false, 1),
('gym', 'Professional', 'GymPro Professional', 'Growing fitness centres', 700, ARRAY['gym_members','gym_classes','gym_attendance','gym_billing','invoices','tasks','staff','accounting'],
 '[{"name":"Members & Subscriptions","included":true},{"name":"Invoices","included":true},{"name":"Payment & Billing","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Class Scheduling","included":true},{"name":"Attendance Tracking","included":true},{"name":"Accounting","included":true}]'::jsonb, true, 2),
('gym', 'Enterprise', 'GymPro Enterprise', 'Large gyms & chains', 950, ARRAY['gym_members','gym_classes','gym_attendance','gym_billing','invoices','tasks','staff','accounting','core_crm'],
 '[{"name":"Members & Subscriptions","included":true},{"name":"Invoices","included":true},{"name":"Payment & Billing","included":true},{"name":"Task Management","included":true},{"name":"Staff & HR","included":true},{"name":"Class Scheduling","included":true},{"name":"Attendance Tracking","included":true},{"name":"Accounting","included":true}]'::jsonb, false, 3);
