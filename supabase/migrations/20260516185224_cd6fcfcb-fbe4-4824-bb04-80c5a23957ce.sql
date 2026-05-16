
-- =========================
-- profiles
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  linkedin text,
  portfolio text,
  preferred_role text,
  resume_skills text[] default '{}',
  plan text default 'Free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles self select" on public.profiles for select using (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- jobs (shared discovery, owned by created_by for edits)
-- =========================
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  company text not null,
  title text not null,
  salary text,
  location text,
  remote text,
  url text not null,
  source text,
  description text,
  posted_at timestamptz,
  ats_score int default 0,
  competition text default 'Medium',
  recommendation text default 'Apply',
  scraped_at timestamptz not null default now(),
  unique (url)
);
alter table public.jobs enable row level security;
create policy "jobs read all auth" on public.jobs for select using (auth.role() = 'authenticated');
create policy "jobs insert own" on public.jobs for insert with check (auth.uid() = created_by or created_by is null);
create policy "jobs update own" on public.jobs for update using (auth.uid() = created_by);
create policy "jobs delete own" on public.jobs for delete using (auth.uid() = created_by);

-- =========================
-- applications
-- =========================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  company text not null,
  title text not null,
  status text not null default 'Saved',
  ats_score int default 0,
  applied_at timestamptz,
  followup_date date,
  followup_sent boolean default false,
  interview_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.applications enable row level security;
create policy "apps self all" on public.applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.applications (user_id, status);

-- =========================
-- recruiter_emails
-- =========================
create table public.recruiter_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  gmail_message_id text,
  company text,
  sender text,
  type text,
  subject text,
  preview text,
  body text,
  received_at timestamptz not null default now(),
  reply_status text not null default 'unread',
  created_at timestamptz not null default now(),
  unique (user_id, gmail_message_id)
);
alter table public.recruiter_emails enable row level security;
create policy "emails self all" on public.recruiter_emails for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================
-- calendar_events
-- =========================
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  google_event_id text,
  created_at timestamptz not null default now()
);
alter table public.calendar_events enable row level security;
create policy "cal self all" on public.calendar_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================
-- resume_versions
-- =========================
create table public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Resume',
  content text,
  ats_score int default 0,
  google_doc_id text,
  google_doc_url text,
  version int not null default 1,
  created_at timestamptz not null default now()
);
alter table public.resume_versions enable row level security;
create policy "resume self all" on public.resume_versions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================
-- cover_letter_versions
-- =========================
create table public.cover_letter_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  content text,
  google_doc_id text,
  google_doc_url text,
  version int not null default 1,
  created_at timestamptz not null default now()
);
alter table public.cover_letter_versions enable row level security;
create policy "cover self all" on public.cover_letter_versions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================
-- daily_briefings
-- =========================
create table public.daily_briefings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  data jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
alter table public.daily_briefings enable row level security;
create policy "briefings self all" on public.daily_briefings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table public.applications;
alter publication supabase_realtime add table public.recruiter_emails;
alter publication supabase_realtime add table public.jobs;
