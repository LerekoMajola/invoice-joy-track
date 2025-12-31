-- Add last_visited_at column to tender_source_links
ALTER TABLE public.tender_source_links 
ADD COLUMN last_visited_at timestamp with time zone DEFAULT NULL;