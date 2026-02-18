
-- ============================================
-- GYM CLASSES (class definitions)
-- ============================================
CREATE TABLE public.gym_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_profile_id uuid REFERENCES public.company_profiles(id),
  name text NOT NULL,
  description text,
  instructor text,
  category text NOT NULL DEFAULT 'general',
  max_capacity integer NOT NULL DEFAULT 20,
  duration_minutes integer NOT NULL DEFAULT 60,
  color text DEFAULT '#6366f1',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage gym_classes" ON public.gym_classes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view gym_classes" ON public.gym_classes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff_members sm WHERE sm.user_id = auth.uid() AND sm.owner_user_id = gym_classes.user_id)
  );

CREATE TRIGGER update_gym_classes_updated_at
  BEFORE UPDATE ON public.gym_classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- GYM CLASS SCHEDULES (recurring weekly slots)
-- ============================================
CREATE TABLE public.gym_class_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_profile_id uuid REFERENCES public.company_profiles(id),
  class_id uuid NOT NULL REFERENCES public.gym_classes(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time time NOT NULL,
  end_time time NOT NULL,
  instructor_override text,
  max_capacity_override integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_class_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage gym_class_schedules" ON public.gym_class_schedules
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view gym_class_schedules" ON public.gym_class_schedules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff_members sm WHERE sm.user_id = auth.uid() AND sm.owner_user_id = gym_class_schedules.user_id)
  );

CREATE TRIGGER update_gym_class_schedules_updated_at
  BEFORE UPDATE ON public.gym_class_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
