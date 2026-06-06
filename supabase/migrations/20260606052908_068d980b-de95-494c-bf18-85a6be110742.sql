ALTER TABLE public.recruiter_emails
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS ai_highlights jsonb,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;