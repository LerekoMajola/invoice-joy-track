-- Migrate existing tax clearance data from company_profiles to tax_clearance_documents
INSERT INTO public.tax_clearance_documents (user_id, activity_name, document_url, expiry_date)
SELECT 
  user_id,
  'General' as activity_name,
  tax_clearance_url as document_url,
  COALESCE(tax_clearance_expiry_date, CURRENT_DATE + INTERVAL '1 year') as expiry_date
FROM public.company_profiles
WHERE tax_clearance_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.tax_clearance_documents td 
    WHERE td.user_id = company_profiles.user_id 
    AND td.document_url = company_profiles.tax_clearance_url
  );