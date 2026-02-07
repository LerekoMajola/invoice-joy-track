-- Add system_type column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN system_type text NOT NULL DEFAULT 'business';

-- Add check constraint for allowed values
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_system_type_check 
CHECK (system_type IN ('business', 'workshop', 'school'));