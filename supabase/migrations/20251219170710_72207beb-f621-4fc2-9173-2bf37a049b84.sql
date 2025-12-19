-- Create labs table for collaboration spaces
CREATE TABLE public.labs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_members table
CREATE TABLE public.lab_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  user_id UUID,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_messages table for instant messaging
CREATE TABLE public.lab_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  user_id UUID,
  username TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_documents table for collaborative documents
CREATE TABLE public.lab_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  yjs_state BYTEA,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_whiteboard table for shared whiteboards
CREATE TABLE public.lab_whiteboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Whiteboard',
  canvas_data JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_whiteboards ENABLE ROW LEVEL SECURITY;

-- Public labs are viewable by everyone
CREATE POLICY "Public labs are viewable by everyone" 
ON public.labs FOR SELECT USING (is_public = true);

CREATE POLICY "Anyone can create labs" 
ON public.labs FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update labs" 
ON public.labs FOR UPDATE USING (true);

-- Lab members policies
CREATE POLICY "Lab members are viewable by everyone" 
ON public.lab_members FOR SELECT USING (true);

CREATE POLICY "Anyone can join labs" 
ON public.lab_members FOR INSERT WITH CHECK (true);

-- Messages policies
CREATE POLICY "Messages are viewable by everyone in public labs" 
ON public.lab_messages FOR SELECT USING (true);

CREATE POLICY "Anyone can send messages" 
ON public.lab_messages FOR INSERT WITH CHECK (true);

-- Documents policies
CREATE POLICY "Documents are viewable by everyone in public labs" 
ON public.lab_documents FOR SELECT USING (true);

CREATE POLICY "Anyone can create documents" 
ON public.lab_documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update documents" 
ON public.lab_documents FOR UPDATE USING (true);

-- Whiteboard policies
CREATE POLICY "Whiteboards are viewable by everyone in public labs" 
ON public.lab_whiteboards FOR SELECT USING (true);

CREATE POLICY "Anyone can create whiteboards" 
ON public.lab_whiteboards FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update whiteboards" 
ON public.lab_whiteboards FOR UPDATE USING (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_messages;

-- Add indexes
CREATE INDEX idx_lab_messages_lab_id ON public.lab_messages(lab_id);
CREATE INDEX idx_lab_documents_lab_id ON public.lab_documents(lab_id);
CREATE INDEX idx_lab_members_lab_id ON public.lab_members(lab_id);