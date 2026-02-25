
-- Add rejection_reason to documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create RPC to safely increment download count
CREATE OR REPLACE FUNCTION public.increment_downloads(doc_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.documents
  SET downloads = downloads + 1
  WHERE id = doc_id AND status = 'approved' AND deleted_at IS NULL;
END;
$$;
