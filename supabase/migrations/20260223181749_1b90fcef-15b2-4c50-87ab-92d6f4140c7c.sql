
-- Add pop_url column to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS pop_url text;

-- Create payment-pop storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-pop', 'payment-pop', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to payment-pop
CREATE POLICY "Authenticated users can upload POP" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-pop');

-- Allow public read access
CREATE POLICY "Public can view POP" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-pop');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their POP" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'payment-pop');
