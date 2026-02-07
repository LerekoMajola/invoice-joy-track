
-- 1. school_subjects
CREATE TABLE public.school_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  short_code TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.school_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subjects" ON public.school_subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subjects" ON public.school_subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subjects" ON public.school_subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subjects" ON public.school_subjects FOR DELETE USING (auth.uid() = user_id);

-- 2. school_periods
CREATE TABLE public.school_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_break BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.school_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own periods" ON public.school_periods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own periods" ON public.school_periods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own periods" ON public.school_periods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own periods" ON public.school_periods FOR DELETE USING (auth.uid() = user_id);

-- 3. timetable_entries
CREATE TABLE public.timetable_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  class_id UUID NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.school_subjects(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES public.school_periods(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT one_subject_per_slot UNIQUE (class_id, period_id, day_of_week)
);

ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries" ON public.timetable_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own entries" ON public.timetable_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.timetable_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.timetable_entries FOR DELETE USING (auth.uid() = user_id);
