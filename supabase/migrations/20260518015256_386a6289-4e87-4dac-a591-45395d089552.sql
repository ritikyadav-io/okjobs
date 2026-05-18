
create table if not exists public.connector_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  connector text not null,
  kind text not null default 'run',
  status text not null,
  message text,
  duration_ms integer,
  ran_at timestamptz not null default now()
);

create index if not exists connector_runs_user_ran_idx on public.connector_runs (user_id, ran_at desc);
create index if not exists connector_runs_user_connector_idx on public.connector_runs (user_id, connector, ran_at desc);

alter table public.connector_runs enable row level security;

create policy "connector_runs self all"
  on public.connector_runs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter publication supabase_realtime add table public.connector_runs;
