// Shared document type used across the app (maps to Supabase documents table)
export interface DocRecord {
  id: string;
  name: string;
  description: string | null;
  file_size: string;
  file_type: string;
  file_url: string | null;
  class_level: string | null;
  subject: string | null;
  status: string;
  downloads: number;
  tags: string[] | null;
  uploaded_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  folder_id: string | null;
  year: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FolderRecord {
  id: string;
  name: string;
  parent_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
