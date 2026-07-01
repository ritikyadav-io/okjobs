
-- Drop FKs to auth.users so tables can hold the single-user sentinel id
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT conname, conrelid::regclass AS tbl FROM pg_constraint
           WHERE contype = 'f' AND connamespace = 'public'::regnamespace
             AND confrelid = 'auth.users'::regclass
  LOOP EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname); END LOOP;
END $$;

-- Disable RLS everywhere in public
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename); END LOOP;
END $$;

-- Broad grants (single-user local app — no cross-user leakage possible)
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated', r.tablename);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', r.tablename);
  END LOOP;
END $$;

-- app_settings holds single-row global config (shared Google connection, etc.)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  google_connection_id text,
  google_email text,
  google_scopes text[],
  cron_secret text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;

-- Seed the single user rows
INSERT INTO public.app_settings (id) VALUES ('00000000-0000-0000-0000-000000000001'::uuid)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name)
  VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'you@okjobs.local', 'You')
  ON CONFLICT (id) DO NOTHING;

-- Drop the on_auth_user_created trigger since we no longer rely on auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
