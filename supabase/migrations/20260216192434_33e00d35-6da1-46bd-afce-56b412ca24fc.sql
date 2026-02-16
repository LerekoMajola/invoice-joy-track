-- Add 'custom' value to the subscription_plan enum type
ALTER TYPE public.subscription_plan ADD VALUE IF NOT EXISTS 'custom';