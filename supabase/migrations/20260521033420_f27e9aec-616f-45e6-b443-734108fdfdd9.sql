ALTER TABLE public.resume_versions ADD COLUMN IF NOT EXISTS job_id uuid;
CREATE INDEX IF NOT EXISTS resume_versions_user_job_idx ON public.resume_versions(user_id, job_id);