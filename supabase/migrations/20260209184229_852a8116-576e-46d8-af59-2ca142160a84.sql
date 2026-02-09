ALTER TABLE public.subscriptions
  DROP CONSTRAINT subscriptions_system_type_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_system_type_check
  CHECK (system_type = ANY (ARRAY['business', 'workshop', 'school', 'legal']));