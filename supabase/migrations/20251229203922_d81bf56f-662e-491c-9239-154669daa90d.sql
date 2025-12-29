-- Add header_info column to company_profiles table
ALTER TABLE public.company_profiles 
ADD COLUMN header_info text;