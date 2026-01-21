-- Add lead time and notes columns to quotes table
ALTER TABLE public.quotes 
ADD COLUMN lead_time text DEFAULT NULL,
ADD COLUMN notes text DEFAULT NULL;