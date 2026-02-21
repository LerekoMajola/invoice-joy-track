
-- Create app-releases storage bucket for APK hosting
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('app-releases', 'app-releases', true, 104857600)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can read app releases"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-releases');

-- Only super admins can upload/delete
CREATE POLICY "Admins can upload app releases"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'app-releases'
  AND public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins can update app releases"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'app-releases'
  AND public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins can delete app releases"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'app-releases'
  AND public.has_role(auth.uid(), 'super_admin')
);
