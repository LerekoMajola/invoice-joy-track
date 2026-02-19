
-- Add pop_url and plan_name columns to gym_member_subscriptions
ALTER TABLE public.gym_member_subscriptions
  ADD COLUMN IF NOT EXISTS pop_url text,
  ADD COLUMN IF NOT EXISTS plan_name text;

-- RLS policy: Portal member can UPDATE their own subscription (for POP upload)
CREATE POLICY "Portal: gym member can upload POP"
  ON public.gym_member_subscriptions FOR UPDATE TO authenticated
  USING (member_id IN (
    SELECT id FROM public.gym_members WHERE portal_user_id = auth.uid()
  ))
  WITH CHECK (member_id IN (
    SELECT id FROM public.gym_members WHERE portal_user_id = auth.uid()
  ));

-- RLS policy: Portal member can SELECT their own subscriptions
CREATE POLICY "Portal: gym member can view own subscriptions"
  ON public.gym_member_subscriptions FOR SELECT TO authenticated
  USING (member_id IN (
    SELECT id FROM public.gym_members WHERE portal_user_id = auth.uid()
  ));

-- Storage bucket for gym proof-of-payment images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gym-pop', 'gym-pop', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Portal members can upload to the gym-pop bucket
CREATE POLICY "Portal member can upload POP"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gym-pop');

-- Storage RLS: Anyone can view gym-pop images (public bucket)
CREATE POLICY "Public can read gym POP"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gym-pop');

-- Storage RLS: Authenticated users can update/replace their POP
CREATE POLICY "Portal member can update POP"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gym-pop');

-- Storage RLS: Authenticated users can delete their POP
CREATE POLICY "Portal member can delete POP"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gym-pop');
