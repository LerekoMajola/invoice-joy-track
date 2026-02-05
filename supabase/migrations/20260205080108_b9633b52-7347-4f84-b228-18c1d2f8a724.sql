-- Drop the overly permissive INSERT policy
DROP POLICY "Service role can insert notifications" ON public.notifications;

-- Create a more restrictive INSERT policy
-- This allows the trigger functions (which run as SECURITY DEFINER) to insert
-- and also allows authenticated users to insert their own notifications
CREATE POLICY "Insert own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);