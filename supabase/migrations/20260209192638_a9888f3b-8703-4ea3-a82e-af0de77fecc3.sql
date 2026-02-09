
-- Create client_documents table
CREATE TABLE public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own client documents"
  ON public.client_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own client documents"
  ON public.client_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client documents"
  ON public.client_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Storage policy for client-docs folder in company-assets bucket
CREATE POLICY "Users can upload client docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-assets'
    AND (storage.foldername(name))[1] = 'client-docs'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can view their client docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'company-assets'
    AND (storage.foldername(name))[1] = 'client-docs'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can delete their client docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-assets'
    AND (storage.foldername(name))[1] = 'client-docs'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Storage policies for legal-documents bucket uploads from case detail
CREATE POLICY "Users can upload legal case docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'legal-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their legal docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'legal-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their legal docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'legal-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
