
-- Update system_type constraint to include guesthouse
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_system_type_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_system_type_check
  CHECK (system_type = ANY (ARRAY['business', 'workshop', 'school', 'legal', 'hire', 'guesthouse']));

-- Rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  room_number TEXT NOT NULL,
  room_type TEXT NOT NULL DEFAULT 'standard',
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  daily_rate NUMERIC NOT NULL DEFAULT 0,
  amenities TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rooms" ON public.rooms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rooms" ON public.rooms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rooms" ON public.rooms FOR DELETE USING (auth.uid() = user_id);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  booking_number TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  guest_id_number TEXT,
  num_guests INTEGER NOT NULL DEFAULT 1,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  actual_check_in TIMESTAMP WITH TIME ZONE,
  actual_check_out TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  total NUMERIC NOT NULL DEFAULT 0,
  deposit_paid NUMERIC NOT NULL DEFAULT 0,
  meal_plan TEXT NOT NULL DEFAULT 'none',
  special_requests TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookings" ON public.bookings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Housekeeping tasks table
CREATE TABLE public.housekeeping_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL DEFAULT 'cleaning',
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own housekeeping tasks" ON public.housekeeping_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own housekeeping tasks" ON public.housekeeping_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own housekeeping tasks" ON public.housekeeping_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own housekeeping tasks" ON public.housekeeping_tasks FOR DELETE USING (auth.uid() = user_id);

-- Guest reviews table
CREATE TABLE public.guest_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  source TEXT NOT NULL DEFAULT 'direct',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guest reviews" ON public.guest_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own guest reviews" ON public.guest_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own guest reviews" ON public.guest_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own guest reviews" ON public.guest_reviews FOR DELETE USING (auth.uid() = user_id);
