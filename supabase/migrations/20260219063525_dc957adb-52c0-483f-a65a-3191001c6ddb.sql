
-- 1. Role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('dos', 'teacher');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'teacher',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Folders table (with soft delete)
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- 4. Documents table (with soft delete and approval)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  file_type TEXT NOT NULL DEFAULT '',
  file_size TEXT NOT NULL DEFAULT '',
  file_url TEXT,
  description TEXT DEFAULT '',
  subject TEXT,
  class_level TEXT,
  year TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 5. Download logs for analytics
CREATE TABLE public.download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT
);
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- 6. Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 7. Function to check if user is DOS
CREATE OR REPLACE FUNCTION public.is_dos()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'dos')
$$;

-- 8. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  -- Default role: teacher
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'teacher');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 10. RLS Policies

-- user_roles: DOS can manage, users can read own
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "DOS can read all roles" ON public.user_roles FOR SELECT USING (public.is_dos());
CREATE POLICY "DOS can manage roles" ON public.user_roles FOR ALL USING (public.is_dos());

-- profiles: users can read/update own, DOS can read all
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "DOS can read all profiles" ON public.profiles FOR SELECT USING (public.is_dos());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "DOS can manage profiles" ON public.profiles FOR ALL USING (public.is_dos());

-- folders: DOS full access, teachers own folders, public read non-deleted
CREATE POLICY "Anyone can read active folders" ON public.folders FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "DOS can manage all folders" ON public.folders FOR ALL USING (public.is_dos());
CREATE POLICY "Teachers can create folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Teachers can update own folders" ON public.folders FOR UPDATE USING (auth.uid() = created_by AND deleted_at IS NULL);

-- documents: DOS full access, teachers own docs, public read approved
CREATE POLICY "Anyone can read approved docs" ON public.documents FOR SELECT USING (status = 'approved' AND deleted_at IS NULL);
CREATE POLICY "Teachers can read own docs" ON public.documents FOR SELECT USING (auth.uid() = uploaded_by);
CREATE POLICY "DOS can read all docs" ON public.documents FOR SELECT USING (public.is_dos());
CREATE POLICY "DOS can manage all docs" ON public.documents FOR ALL USING (public.is_dos());
CREATE POLICY "Teachers can insert docs" ON public.documents FOR INSERT WITH CHECK (auth.uid() = uploaded_by AND status = 'pending');
CREATE POLICY "Teachers can update own docs" ON public.documents FOR UPDATE USING (auth.uid() = uploaded_by AND deleted_at IS NULL);

-- download_logs: DOS can read all, anyone can insert
CREATE POLICY "DOS can read download logs" ON public.download_logs FOR SELECT USING (public.is_dos());
CREATE POLICY "Anyone can log downloads" ON public.download_logs FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_deleted_at ON public.documents(deleted_at);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_folders_deleted_at ON public.folders(deleted_at);
CREATE INDEX idx_download_logs_document_id ON public.download_logs(document_id);
CREATE INDEX idx_download_logs_downloaded_at ON public.download_logs(downloaded_at);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
