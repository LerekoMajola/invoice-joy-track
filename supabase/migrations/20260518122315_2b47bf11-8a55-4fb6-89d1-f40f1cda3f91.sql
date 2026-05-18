-- Update default for company_profiles
ALTER TABLE public.company_profiles ALTER COLUMN country SET DEFAULT '
';

-- Update existing 'Lesotho' values to newline
UPDATE public.company_profiles SET country = '
' WHERE country = 'Lesotho';