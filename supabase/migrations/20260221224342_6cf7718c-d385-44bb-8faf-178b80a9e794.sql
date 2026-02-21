
CREATE TABLE public.portal_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.gym_members(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portal_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portal users read own notifications"
  ON public.portal_notifications FOR SELECT
  USING (portal_user_id = auth.uid());

CREATE POLICY "Portal users mark own as read"
  ON public.portal_notifications FOR UPDATE
  USING (portal_user_id = auth.uid());

-- Allow gym owners to insert notifications for their members
CREATE POLICY "Owners can insert portal notifications"
  ON public.portal_notifications FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_portal_notifications_user ON public.portal_notifications(portal_user_id, is_read);
