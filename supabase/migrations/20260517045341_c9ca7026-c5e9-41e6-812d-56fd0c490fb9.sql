ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_url_key;
CREATE UNIQUE INDEX IF NOT EXISTS jobs_created_by_url_key ON public.jobs (created_by, url);