-- Add vat_enabled column to company_profiles
ALTER TABLE public.company_profiles 
ADD COLUMN vat_enabled BOOLEAN DEFAULT true;