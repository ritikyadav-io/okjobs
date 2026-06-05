CREATE TABLE public.user_google_connections (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id text NOT NULL,
  email text,
  scopes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_google_connections TO authenticated;
GRANT ALL ON public.user_google_connections TO service_role;
ALTER TABLE public.user_google_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ugc_select_own" ON public.user_google_connections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ugc_insert_own" ON public.user_google_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ugc_update_own" ON public.user_google_connections FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ugc_delete_own" ON public.user_google_connections FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_user_google_connections_updated_at BEFORE UPDATE ON public.user_google_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();