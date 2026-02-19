
-- Portal: guardian reads their child's student record
CREATE POLICY "Portal: guardian reads own student record"
  ON public.students FOR SELECT TO authenticated
  USING (portal_user_id = auth.uid());

-- Portal: guardian reads fee payments for their child (correct table: student_fee_payments)
CREATE POLICY "Portal: guardian reads fee payments"
  ON public.student_fee_payments FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM public.students WHERE portal_user_id = auth.uid()
  ));

-- Portal: guardian reads academic terms for their school
CREATE POLICY "Portal: guardian reads academic terms"
  ON public.academic_terms FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT owner_user_id FROM public.students WHERE portal_user_id = auth.uid()
  ));

-- Portal: guardian reads school classes for their school
CREATE POLICY "Portal: guardian reads school classes"
  ON public.school_classes FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT owner_user_id FROM public.students WHERE portal_user_id = auth.uid()
  ));

-- Portal: guardian reads timetable entries for their child's class
CREATE POLICY "Portal: guardian reads timetable entries"
  ON public.timetable_entries FOR SELECT TO authenticated
  USING (class_id IN (
    SELECT class_id FROM public.students
    WHERE portal_user_id = auth.uid() AND class_id IS NOT NULL
  ));

-- Portal: guardian reads school periods (correct table: school_periods)
CREATE POLICY "Portal: guardian reads school periods"
  ON public.school_periods FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT owner_user_id FROM public.students WHERE portal_user_id = auth.uid()
  ));

-- Portal: guardian reads school subjects (correct table: school_subjects)
CREATE POLICY "Portal: guardian reads school subjects"
  ON public.school_subjects FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT owner_user_id FROM public.students WHERE portal_user_id = auth.uid()
  ));
