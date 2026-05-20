
create table if not exists public.job_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  task text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  priority integer not null default 0,
  progress integer not null default 0,
  result jsonb,
  last_error text,
  scheduled_for timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_queue_status_sched_idx on public.job_queue (status, scheduled_for);
create index if not exists job_queue_user_idx on public.job_queue (user_id, created_at desc);

alter table public.job_queue enable row level security;

drop policy if exists "job_queue self all" on public.job_queue;
create policy "job_queue self all" on public.job_queue
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger job_queue_updated_at
  before update on public.job_queue
  for each row execute function public.update_updated_at_column();

-- dedupe jobs by (created_by, url)
create unique index if not exists jobs_created_by_url_uidx on public.jobs (created_by, url);

-- realtime
alter table public.job_queue replica identity full;
alter table public.jobs replica identity full;
alter table public.recruiter_emails replica identity full;

do $$ begin
  perform 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'job_queue';
  if not found then alter publication supabase_realtime add table public.job_queue; end if;
  perform 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'jobs';
  if not found then alter publication supabase_realtime add table public.jobs; end if;
  perform 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'recruiter_emails';
  if not found then alter publication supabase_realtime add table public.recruiter_emails; end if;
end $$;
