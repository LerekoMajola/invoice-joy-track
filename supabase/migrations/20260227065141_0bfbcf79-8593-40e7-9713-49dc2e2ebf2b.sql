
CREATE TABLE public.scraped_tenders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  company_profile_id uuid REFERENCES public.company_profiles(id),
  title text NOT NULL,
  organization text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  closing_date text,
  reference_number text,
  source_url text NOT NULL DEFAULT '',
  source_name text NOT NULL DEFAULT '',
  estimated_value text,
  category text,
  is_saved boolean NOT NULL DEFAULT false,
  is_dismissed boolean NOT NULL DEFAULT false,
  scraped_at timestamptz NOT NULL DEFAULT now(),
  raw_content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scraped_tenders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own scraped tenders"
  ON public.scraped_tenders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scraped tenders"
  ON public.scraped_tenders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraped tenders"
  ON public.scraped_tenders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraped tenders"
  ON public.scraped_tenders FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_scraped_tenders_user_id ON public.scraped_tenders(user_id);
CREATE INDEX idx_scraped_tenders_dismissed ON public.scraped_tenders(user_id, is_dismissed);
