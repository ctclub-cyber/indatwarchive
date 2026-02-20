-- Create storage bucket for document files
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Authenticated users can upload files to their own folder
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DOS can read all files
CREATE POLICY "DOS can read all documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND public.is_dos());

-- Users can read their own files
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DOS can delete files
CREATE POLICY "DOS can delete documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND public.is_dos());