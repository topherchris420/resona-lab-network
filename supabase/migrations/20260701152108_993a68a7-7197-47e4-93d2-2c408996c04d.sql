ALTER TABLE public.project_resonances REPLICA IDENTITY FULL;
ALTER TABLE public.project_forks REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'project_resonances'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_resonances;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'project_forks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_forks;
  END IF;
END $$;