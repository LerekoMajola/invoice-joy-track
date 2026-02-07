
-- Create platform_settings table for platform-wide configuration
CREATE TABLE public.platform_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (logo needs to show on unauthenticated pages)
CREATE POLICY "Anyone can read platform settings"
ON public.platform_settings
FOR SELECT
USING (true);

-- Only super admins can insert
CREATE POLICY "Super admins can insert platform settings"
ON public.platform_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Only super admins can update
CREATE POLICY "Super admins can update platform settings"
ON public.platform_settings
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Only super admins can delete
CREATE POLICY "Super admins can delete platform settings"
ON public.platform_settings
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));
