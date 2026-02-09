
-- =============================================
-- LEGAL PRACTICE MANAGEMENT SYSTEM - ALL TABLES
-- =============================================

-- 1. LEGAL CASES (The Heart)
CREATE TABLE public.legal_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  case_number TEXT NOT NULL,
  title TEXT NOT NULL,
  case_type TEXT NOT NULL DEFAULT 'civil',
  status TEXT NOT NULL DEFAULT 'open',
  court_name TEXT,
  court_case_number TEXT,
  opposing_party TEXT,
  opposing_counsel TEXT,
  judge_name TEXT,
  filing_date DATE,
  next_hearing_date DATE,
  description TEXT,
  notes TEXT,
  assigned_lawyer TEXT,
  priority TEXT DEFAULT 'medium',
  estimated_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, case_number)
);

ALTER TABLE public.legal_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own legal cases" ON public.legal_cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own legal cases" ON public.legal_cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own legal cases" ON public.legal_cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own legal cases" ON public.legal_cases FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_legal_cases_updated_at BEFORE UPDATE ON public.legal_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. LEGAL CASE NOTES (Secure / Confidential)
CREATE TABLE public.legal_case_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own case notes" ON public.legal_case_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.legal_cases WHERE id = legal_case_notes.case_id AND user_id = auth.uid()));
CREATE POLICY "Users can create own case notes" ON public.legal_case_notes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.legal_cases WHERE id = legal_case_notes.case_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own case notes" ON public.legal_case_notes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.legal_cases WHERE id = legal_case_notes.case_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own case notes" ON public.legal_case_notes FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.legal_cases WHERE id = legal_case_notes.case_id AND user_id = auth.uid()));

CREATE TRIGGER update_legal_case_notes_updated_at BEFORE UPDATE ON public.legal_case_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. LEGAL TIME ENTRIES (Billable Hours)
CREATE TABLE public.legal_time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours NUMERIC NOT NULL DEFAULT 0,
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  activity_type TEXT DEFAULT 'consultation',
  is_billable BOOLEAN DEFAULT true,
  is_invoiced BOOLEAN DEFAULT false,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time entries" ON public.legal_time_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own time entries" ON public.legal_time_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time entries" ON public.legal_time_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own time entries" ON public.legal_time_entries FOR DELETE USING (auth.uid() = user_id);

-- 4. LEGAL DOCUMENTS (Contracts, Court Papers, Evidence)
CREATE TABLE public.legal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT 'other',
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own legal documents" ON public.legal_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own legal documents" ON public.legal_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own legal documents" ON public.legal_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own legal documents" ON public.legal_documents FOR DELETE USING (auth.uid() = user_id);

-- 5. LEGAL CALENDAR EVENTS (Court Dates, Deadlines, Meetings)
CREATE TABLE public.legal_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'hearing',
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  end_time TIME,
  location TEXT,
  description TEXT,
  reminder_date DATE,
  is_completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar events" ON public.legal_calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own calendar events" ON public.legal_calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar events" ON public.legal_calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar events" ON public.legal_calendar_events FOR DELETE USING (auth.uid() = user_id);

-- 6. STORAGE BUCKET for legal documents (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('legal-documents', 'legal-documents', false);

CREATE POLICY "Users can upload legal documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'legal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own legal documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'legal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own legal documents" ON storage.objects FOR DELETE
  USING (bucket_id = 'legal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 7. INDEXES for performance
CREATE INDEX idx_legal_cases_user_id ON public.legal_cases(user_id);
CREATE INDEX idx_legal_cases_status ON public.legal_cases(status);
CREATE INDEX idx_legal_cases_client_id ON public.legal_cases(client_id);
CREATE INDEX idx_legal_time_entries_case_id ON public.legal_time_entries(case_id);
CREATE INDEX idx_legal_time_entries_user_id ON public.legal_time_entries(user_id);
CREATE INDEX idx_legal_time_entries_date ON public.legal_time_entries(date);
CREATE INDEX idx_legal_documents_case_id ON public.legal_documents(case_id);
CREATE INDEX idx_legal_calendar_events_user_id ON public.legal_calendar_events(user_id);
CREATE INDEX idx_legal_calendar_events_date ON public.legal_calendar_events(event_date);
CREATE INDEX idx_legal_case_notes_case_id ON public.legal_case_notes(case_id);
