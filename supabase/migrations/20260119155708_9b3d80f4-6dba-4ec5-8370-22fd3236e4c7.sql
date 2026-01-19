-- Add default_validity_days column to company_profiles table
ALTER TABLE public.company_profiles
ADD COLUMN default_validity_days integer DEFAULT 90;