
-- Add system_type column to platform_modules
ALTER TABLE public.platform_modules 
  ADD COLUMN system_type text NOT NULL DEFAULT 'shared';

-- Tag industry-specific modules
UPDATE public.platform_modules SET system_type = 'business' WHERE key = 'tenders';
UPDATE public.platform_modules SET system_type = 'workshop' WHERE key = 'workshop';
UPDATE public.platform_modules SET system_type = 'school' WHERE key IN ('school_admin', 'students', 'school_fees');
-- All other modules remain 'shared' (the default)
