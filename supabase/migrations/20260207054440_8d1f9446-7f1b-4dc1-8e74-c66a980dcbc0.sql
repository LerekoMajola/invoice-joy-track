
-- Allow super admins to upload platform assets
CREATE POLICY "Super admins can upload platform assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-assets'
  AND (storage.foldername(name))[1] = 'platform'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- Allow super admins to update platform assets
CREATE POLICY "Super admins can update platform assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-assets'
  AND (storage.foldername(name))[1] = 'platform'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- Allow super admins to delete platform assets
CREATE POLICY "Super admins can delete platform assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-assets'
  AND (storage.foldername(name))[1] = 'platform'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- Allow anyone to view platform assets (logo must show on public pages)
CREATE POLICY "Anyone can view platform assets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'company-assets'
  AND (storage.foldername(name))[1] = 'platform'
);
