
-- Create student_report_cards table
CREATE TABLE public.student_report_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES public.academic_terms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  overall_grade TEXT,
  overall_percentage NUMERIC,
  teacher_comments TEXT,
  principal_comments TEXT,
  attendance_days INTEGER,
  attendance_total INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_report_cards ENABLE ROW LEVEL SECURITY;

-- School owner can CRUD
CREATE POLICY "School owners can manage report cards"
  ON public.student_report_cards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Portal users (parents) can read published reports for their child
CREATE POLICY "Parents can view published report cards"
  ON public.student_report_cards FOR SELECT
  USING (
    is_published = true
    AND student_id IN (
      SELECT id FROM public.students WHERE guardian_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Create student_subject_grades table
CREATE TABLE public.student_subject_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_card_id UUID NOT NULL REFERENCES public.student_report_cards(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  grade TEXT,
  percentage NUMERIC,
  teacher_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_subject_grades ENABLE ROW LEVEL SECURITY;

-- School owner can CRUD via report card ownership
CREATE POLICY "School owners can manage subject grades"
  ON public.student_subject_grades FOR ALL
  USING (
    report_card_id IN (SELECT id FROM public.student_report_cards WHERE user_id = auth.uid())
  )
  WITH CHECK (
    report_card_id IN (SELECT id FROM public.student_report_cards WHERE user_id = auth.uid())
  );

-- Parents can read published subject grades
CREATE POLICY "Parents can view published subject grades"
  ON public.student_subject_grades FOR SELECT
  USING (
    report_card_id IN (
      SELECT id FROM public.student_report_cards
      WHERE is_published = true
        AND student_id IN (
          SELECT id FROM public.students WHERE guardian_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
  );

-- Enable realtime for school_announcements
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_announcements;
