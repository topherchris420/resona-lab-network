CREATE TABLE public.catalyst_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea text NOT NULL,
  domain text NOT NULL DEFAULT 'general_research',
  seed integer NOT NULL DEFAULT 137,
  mode text NOT NULL DEFAULT 'ai',
  status text NOT NULL DEFAULT 'pending',
  error text,
  spec jsonb,
  architecture jsonb,
  experiment jsonb,
  implementation jsonb,
  verification jsonb,
  validation jsonb,
  hypothesis_graph jsonb,
  mermaid text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  visibility text NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalyst_runs TO authenticated;
GRANT SELECT ON public.catalyst_runs TO anon;
GRANT ALL ON public.catalyst_runs TO service_role;

ALTER TABLE public.catalyst_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public catalyst runs are viewable by everyone"
  ON public.catalyst_runs FOR SELECT
  USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own catalyst runs"
  ON public.catalyst_runs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catalyst runs"
  ON public.catalyst_runs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catalyst runs"
  ON public.catalyst_runs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_catalyst_runs_updated_at
  BEFORE UPDATE ON public.catalyst_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.catalyst_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.catalyst_runs(id) ON DELETE CASCADE,
  seq integer NOT NULL DEFAULT 0,
  stage text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  hash text NOT NULL,
  prev_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.catalyst_events TO authenticated;
GRANT SELECT ON public.catalyst_events TO anon;
GRANT ALL ON public.catalyst_events TO service_role;

ALTER TABLE public.catalyst_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalyst events follow run visibility"
  ON public.catalyst_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.catalyst_runs r
    WHERE r.id = catalyst_events.run_id
      AND (r.visibility = 'public' OR r.user_id = auth.uid())
  ));

CREATE INDEX catalyst_runs_user_idx ON public.catalyst_runs (user_id, created_at DESC);
CREATE INDEX catalyst_events_run_idx ON public.catalyst_events (run_id, seq);