do $$
begin
  alter publication supabase_realtime add table public.applications;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.jobs;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.recruiter_emails;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.calendar_events;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.daily_briefings;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.resume_versions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.cover_letter_versions;
exception when duplicate_object then null;
end $$;