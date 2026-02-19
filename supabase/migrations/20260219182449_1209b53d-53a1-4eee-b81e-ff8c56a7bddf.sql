
-- Add owner_user_id + portal_user_id to gym_members
ALTER TABLE public.gym_members
  ADD COLUMN IF NOT EXISTS owner_user_id UUID,
  ADD COLUMN IF NOT EXISTS portal_user_id UUID;

-- Backfill owner_user_id from the existing user_id (gym owner)
UPDATE public.gym_members
  SET owner_user_id = user_id
  WHERE owner_user_id IS NULL AND user_id IS NOT NULL;

-- Add owner_user_id + portal_user_id to students
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS owner_user_id UUID,
  ADD COLUMN IF NOT EXISTS portal_user_id UUID;

-- Backfill owner_user_id from the existing user_id (school owner)
UPDATE public.students
  SET owner_user_id = user_id
  WHERE owner_user_id IS NULL AND user_id IS NOT NULL;
