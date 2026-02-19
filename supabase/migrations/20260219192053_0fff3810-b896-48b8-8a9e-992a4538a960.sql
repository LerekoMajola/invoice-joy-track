
-- Create gym_class_bookings table
CREATE TABLE public.gym_class_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  schedule_id uuid NOT NULL REFERENCES public.gym_class_schedules(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  booked_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'booked',
  UNIQUE(schedule_id, member_id)
);

-- Enable RLS
ALTER TABLE public.gym_class_bookings ENABLE ROW LEVEL SECURITY;

-- Gym owner can see all bookings under their user_id
CREATE POLICY "Owner can view own gym class bookings"
  ON public.gym_class_bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Gym owner can insert bookings (for admin adding members)
CREATE POLICY "Owner can insert gym class bookings"
  ON public.gym_class_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Gym owner can update bookings
CREATE POLICY "Owner can update gym class bookings"
  ON public.gym_class_bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Gym owner can delete bookings
CREATE POLICY "Owner can delete gym class bookings"
  ON public.gym_class_bookings FOR DELETE
  USING (auth.uid() = user_id);

-- Portal member can SELECT their own bookings
CREATE POLICY "Portal member can view own bookings"
  ON public.gym_class_bookings FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM public.gym_members
      WHERE portal_user_id = auth.uid()
    )
  );

-- Portal member can INSERT their own booking (check-in to class)
CREATE POLICY "Portal member can book a class"
  ON public.gym_class_bookings FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM public.gym_members
      WHERE portal_user_id = auth.uid()
    )
  );

-- Portal member can UPDATE (cancel) their own booking
CREATE POLICY "Portal member can cancel own booking"
  ON public.gym_class_bookings FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM public.gym_members
      WHERE portal_user_id = auth.uid()
    )
  );
