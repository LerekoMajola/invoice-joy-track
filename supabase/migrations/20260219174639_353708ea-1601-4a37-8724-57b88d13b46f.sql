
-- Create portal_messages table for real-time messaging between portal users and business owners
CREATE TABLE public.portal_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('member', 'guardian', 'business')),
  sender_id TEXT NOT NULL,
  recipient_owner_id UUID NOT NULL,
  portal_type TEXT NOT NULL CHECK (portal_type IN ('gym', 'school')),
  reference_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.portal_messages ENABLE ROW LEVEL SECURITY;

-- Portal users can insert their own messages
CREATE POLICY "portal_messages_insert"
  ON public.portal_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid()::text);

-- Portal users can read messages in their thread (as sender or as the business owner recipient)
CREATE POLICY "portal_messages_select"
  ON public.portal_messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid()::text
    OR recipient_owner_id = auth.uid()
  );

-- Business owners can update messages (mark as read)
CREATE POLICY "portal_messages_update"
  ON public.portal_messages
  FOR UPDATE
  TO authenticated
  USING (recipient_owner_id = auth.uid())
  WITH CHECK (recipient_owner_id = auth.uid());

-- Enable realtime for portal_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_messages;
