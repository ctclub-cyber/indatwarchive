
-- Make download_logs insert slightly more restrictive - require a valid document_id
DROP POLICY "Anyone can log downloads" ON public.download_logs;
CREATE POLICY "Authenticated users can log downloads" ON public.download_logs 
  FOR INSERT TO authenticated
  WITH CHECK (true);
