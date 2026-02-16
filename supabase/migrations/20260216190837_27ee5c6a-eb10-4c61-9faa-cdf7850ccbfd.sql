
-- Update system_type constraint to include 'gym'
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_system_type_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_system_type_check
  CHECK (system_type IN ('business', 'workshop', 'school', 'legal', 'hire', 'guesthouse', 'fleet', 'gym'));
