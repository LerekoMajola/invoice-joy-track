
ALTER TABLE public.tasks ADD COLUMN due_time time without time zone;
ALTER TABLE public.tasks ADD COLUMN reminder_minutes_before integer DEFAULT 15;
