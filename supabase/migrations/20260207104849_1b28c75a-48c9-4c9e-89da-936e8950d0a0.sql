
-- ==========================================
-- School Management System Tables
-- ==========================================

-- 1. School Classes
CREATE TABLE public.school_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  grade_level text,
  class_teacher_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  capacity integer,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own classes" ON public.school_classes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own classes" ON public.school_classes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own classes" ON public.school_classes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own classes" ON public.school_classes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_school_classes_updated_at
  BEFORE UPDATE ON public.school_classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Students
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  admission_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  gender text,
  class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  enrollment_date date,
  status text NOT NULL DEFAULT 'active',
  address text,
  medical_notes text,
  photo_url text,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  guardian_relationship text,
  secondary_guardian_name text,
  secondary_guardian_phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own students" ON public.students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own students" ON public.students FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own students" ON public.students FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own students" ON public.students FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Academic Terms
CREATE TABLE public.academic_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own terms" ON public.academic_terms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own terms" ON public.academic_terms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own terms" ON public.academic_terms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own terms" ON public.academic_terms FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_academic_terms_updated_at
  BEFORE UPDATE ON public.academic_terms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Fee Schedules
CREATE TABLE public.fee_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  term_id uuid NOT NULL REFERENCES public.academic_terms(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  fee_type text NOT NULL,
  amount numeric NOT NULL,
  is_optional boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fee_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fee schedules" ON public.fee_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fee schedules" ON public.fee_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fee schedules" ON public.fee_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fee schedules" ON public.fee_schedules FOR DELETE USING (auth.uid() = user_id);

-- 5. Student Fee Payments
CREATE TABLE public.student_fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  term_id uuid NOT NULL REFERENCES public.academic_terms(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date date NOT NULL,
  payment_method text,
  reference_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_fee_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.student_fee_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own payments" ON public.student_fee_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON public.student_fee_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payments" ON public.student_fee_payments FOR DELETE USING (auth.uid() = user_id);

-- 6. School Announcements
CREATE TABLE public.school_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  target_class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own announcements" ON public.school_announcements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own announcements" ON public.school_announcements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own announcements" ON public.school_announcements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own announcements" ON public.school_announcements FOR DELETE USING (auth.uid() = user_id);

-- 7. Add student_id to invoices for fee invoice linking
ALTER TABLE public.invoices ADD COLUMN student_id uuid REFERENCES public.students(id) ON DELETE SET NULL;

-- 8. Register school modules in platform_modules
INSERT INTO public.platform_modules (name, key, description, icon, monthly_price, is_core, is_active, sort_order)
VALUES 
  ('School Admin', 'school_admin', 'Manage classes, academic terms, and school announcements', 'School', 100, false, true, 20),
  ('Student Management', 'students', 'Create and manage student profiles with guardian details', 'GraduationCap', 80, false, true, 21),
  ('School Fees', 'school_fees', 'Fee schedules, payment tracking, and fee collection dashboard', 'Wallet', 60, false, true, 22);
