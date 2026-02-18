
-- Add soft-delete column to company_profiles
ALTER TABLE public.company_profiles ADD COLUMN deleted_at timestamptz DEFAULT NULL;

-- Add soft-delete column to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN deleted_at timestamptz DEFAULT NULL;
