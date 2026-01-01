-- Add company document fields to company_profiles table
ALTER TABLE public.company_profiles
ADD COLUMN IF NOT EXISTS tax_clearance_url text,
ADD COLUMN IF NOT EXISTS tax_clearance_expiry_date date,
ADD COLUMN IF NOT EXISTS business_id_url text,
ADD COLUMN IF NOT EXISTS company_profile_doc_url text;