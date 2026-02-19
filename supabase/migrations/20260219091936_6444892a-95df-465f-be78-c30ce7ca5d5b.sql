-- Allow any authenticated user to insert a payment notification for admin
CREATE POLICY "Allow payment notifications to admin"
ON public.notifications
FOR INSERT
WITH CHECK (
  type = 'payment'
  AND reference_type = 'subscription'
  AND auth.uid() IS NOT NULL
);
