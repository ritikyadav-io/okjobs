create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Ensure profiles are created for new email/password and Google users.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- General updated_at helper for app tables.
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists update_applications_updated_at on public.applications;
create trigger update_applications_updated_at
before update on public.applications
for each row execute function public.update_updated_at_column();

-- Prevent duplicate imports from connectors.
create unique index if not exists recruiter_emails_user_gmail_message_uidx
on public.recruiter_emails (user_id, gmail_message_id)
where gmail_message_id is not null;

create unique index if not exists calendar_events_user_google_event_uidx
on public.calendar_events (user_id, google_event_id)
where google_event_id is not null;

create unique index if not exists jobs_created_by_url_uidx
on public.jobs (created_by, url)
where created_by is not null;

create index if not exists applications_user_followup_idx
on public.applications (user_id, followup_date, status);

create index if not exists jobs_created_by_score_idx
on public.jobs (created_by, ats_score desc);

-- Reset Zenith cron jobs before recreating them.
select cron.unschedule(jobname) from cron.job where jobname in (
  'zenith-sync-recruiter-inbox-15min',
  'zenith-scrape-jobs-6h',
  'zenith-send-daily-briefing-8am'
);

select cron.schedule(
  'zenith-sync-recruiter-inbox-15min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://project--9560ca5b-9186-443b-959d-168297c17100-dev.lovable.app/api/public/cron/gmail-sync',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImtkcHBmd3N3bmdqdGZscGl1dnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDY0MTAsImV4cCI6MjA5NDUyMjQxMH0.AsjlmrurrNerKjcjdVNP6i3eilo2oPCm0gQuWwr14Dc"}'::jsonb,
    body := '{"source":"pg_cron"}'::jsonb
  ) as request_id;
  $$
);

select cron.schedule(
  'zenith-scrape-jobs-6h',
  '0 */6 * * *',
  $$
  select net.http_post(
    url := 'https://project--9560ca5b-9186-443b-959d-168297c17100-dev.lovable.app/api/public/cron/scrape-jobs',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImtkcHBmd3N3bmdqdGZscGl1dnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDY0MTAsImV4cCI6MjA5NDUyMjQxMH0.AsjlmrurrNerKjcjdVNP6i3eilo2oPCm0gQuWwr14Dc"}'::jsonb,
    body := '{"source":"pg_cron"}'::jsonb
  ) as request_id;
  $$
);

select cron.schedule(
  'zenith-send-daily-briefing-8am',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://project--9560ca5b-9186-443b-959d-168297c17100-dev.lovable.app/api/public/cron/daily-briefing',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImtkcHBmd3N3bmdqdGZscGl1dnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDY0MTAsImV4cCI6MjA5NDUyMjQxMH0.AsjlmrurrNerKjcjdVNP6i3eilo2oPCm0gQuWwr14Dc"}'::jsonb,
    body := '{"source":"pg_cron"}'::jsonb
  ) as request_id;
  $$
);