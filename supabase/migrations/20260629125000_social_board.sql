-- Real social board primitives: identity, projects, comments, resonances, forks, follows, and notifications.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  dataset_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_resonances (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.project_forks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  forked_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (source_project_id, author_id)
);

CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('comment', 'resonance', 'fork', 'follow')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_resonances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_forks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_project_comments_updated_at ON public.project_comments;
CREATE TRIGGER set_project_comments_updated_at
BEFORE UPDATE ON public.project_comments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_username TEXT;
BEGIN
  base_username := lower(regexp_replace(coalesce(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1), 'resona'), '[^a-z0-9_]+', '', 'g'));

  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    coalesce(nullif(base_username, ''), 'resona') || '_' || substr(NEW.id::text, 1, 6),
    coalesce(nullif(NEW.raw_user_meta_data ->> 'full_name', ''), split_part(NEW.email, '@', 1), 'Resona Researcher'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;
CREATE POLICY "Profiles are public"
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;
CREATE POLICY "Users can insert their profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their profile" ON public.profiles;
CREATE POLICY "Users can update their profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Public projects are viewable" ON public.projects;
CREATE POLICY "Public projects are viewable"
ON public.projects FOR SELECT
USING (visibility = 'public' OR author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can create projects" ON public.projects;
CREATE POLICY "Authors can create projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update projects" ON public.projects;
CREATE POLICY "Authors can update projects"
ON public.projects FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete projects" ON public.projects;
CREATE POLICY "Authors can delete projects"
ON public.projects FOR DELETE
TO authenticated
USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Project comments are public" ON public.project_comments;
CREATE POLICY "Project comments are public"
ON public.project_comments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Signed-in users can comment" ON public.project_comments;
CREATE POLICY "Signed-in users can comment"
ON public.project_comments FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update comments" ON public.project_comments;
CREATE POLICY "Authors can update comments"
ON public.project_comments FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete comments" ON public.project_comments;
CREATE POLICY "Authors can delete comments"
ON public.project_comments FOR DELETE
TO authenticated
USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Resonances are public" ON public.project_resonances;
CREATE POLICY "Resonances are public"
ON public.project_resonances FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can resonate" ON public.project_resonances;
CREATE POLICY "Users can resonate"
ON public.project_resonances FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can remove their resonance" ON public.project_resonances;
CREATE POLICY "Users can remove their resonance"
ON public.project_resonances FOR DELETE
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Forks are public" ON public.project_forks;
CREATE POLICY "Forks are public"
ON public.project_forks FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can fork projects" ON public.project_forks;
CREATE POLICY "Users can fork projects"
ON public.project_forks FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Follows are public" ON public.follows;
CREATE POLICY "Follows are public"
ON public.follows FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can follow" ON public.follows;
CREATE POLICY "Users can follow"
ON public.follows FOR INSERT
TO authenticated
WITH CHECK (follower_id = auth.uid());

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
ON public.follows FOR DELETE
TO authenticated
USING (follower_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can mark their notifications read" ON public.notifications;
CREATE POLICY "Users can mark their notifications read"
ON public.notifications FOR UPDATE
TO authenticated
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (actor_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_projects_author_id ON public.projects(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_resonances_project_id ON public.project_resonances(project_id);
CREATE INDEX IF NOT EXISTS idx_project_forks_source_project_id ON public.project_forks(source_project_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id, read_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_resonances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_forks;

-- Tighten the original lab tables: reads stay public for public labs, writes require auth.
DROP POLICY IF EXISTS "Anyone can create labs" ON public.labs;
DROP POLICY IF EXISTS "Anyone can update labs" ON public.labs;
DROP POLICY IF EXISTS "Anyone can join labs" ON public.lab_members;
DROP POLICY IF EXISTS "Anyone can send messages" ON public.lab_messages;
DROP POLICY IF EXISTS "Anyone can create documents" ON public.lab_documents;
DROP POLICY IF EXISTS "Anyone can update documents" ON public.lab_documents;
DROP POLICY IF EXISTS "Anyone can create whiteboards" ON public.lab_whiteboards;
DROP POLICY IF EXISTS "Anyone can update whiteboards" ON public.lab_whiteboards;

CREATE POLICY "Authenticated users can create labs"
ON public.labs FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Lab owners can update labs"
ON public.labs FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Authenticated users can join labs"
ON public.lab_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can send messages"
ON public.lab_messages FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can create documents"
ON public.lab_documents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents"
ON public.lab_documents FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create whiteboards"
ON public.lab_whiteboards FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update whiteboards"
ON public.lab_whiteboards FOR UPDATE
TO authenticated
USING (true);
