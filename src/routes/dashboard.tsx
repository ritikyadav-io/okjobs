import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { StatCard } from "@/components/zenith/StatCard";
import { Briefcase, Calendar, Inbox, Bell, ArrowRight, Sparkles, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { dashboardStats, listApplications } from "@/lib/applications.functions";
import { listJobs } from "@/lib/jobs.functions";
import { listRecruiterEmails } from "@/lib/gmail.functions";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OkJobs" }, { name: "description", content: "Your job search command center." }] }),
  component: Dashboard,
});

const STATUSES = ["Saved", "Applied", "OA Received", "Interview Scheduled", "Offer Received", "Rejected"];
const COLORS: Record<string, string> = {
  Saved: "bg-muted-foreground", Applied: "bg-primary", "OA Received": "bg-gold",
  "Interview Scheduled": "bg-cyan", "Offer Received": "bg-success", Rejected: "bg-danger",
};

function Dashboard() {
  const { profile } = useAuth();
  const statsFn = useServerFn(dashboardStats);
  const jobsFn = useServerFn(listJobs);
  const emailsFn = useServerFn(listRecruiterEmails);
  const appsFn = useServerFn(listApplications);
  useRealtimeRefresh(["applications", "jobs", "recruiter_emails", "calendar_events", "daily_briefings"], [["dashboard-stats"], ["jobs"], ["emails"], ["applications"], ["briefing"]]);

  const stats = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => statsFn(), staleTime: 30_000, placeholderData: (p) => p });
  const jobs = useQuery({ queryKey: ["jobs"], queryFn: () => jobsFn() });
  const emails = useQuery({ queryKey: ["emails"], queryFn: () => emailsFn() });
  const apps = useQuery({ queryKey: ["applications"], queryFn: () => appsFn() });

  const byStatus = stats.data?.byStatus ?? {};
  const max = Math.max(1, ...STATUSES.map((s) => byStatus[s] ?? 0));
  const greet = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <AppShell>
      <PageHeader
        title={`Good morning, ${greet} 👋`}
        description="Here's what OkJobs found while you were sleeping."
        actions={
          <Link to="/jobs" className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">
            Browse jobs <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Applications" value={stats.data?.totalApplications ?? 0} icon={Briefcase} accent="primary" />
        <StatCard label="Interviews Scheduled" value={stats.data?.interviewsScheduled ?? 0} icon={Calendar} accent="cyan" />
        <StatCard label="Recruiter Replies" value={stats.data?.recruiterReplies ?? 0} hint={`${stats.data?.unreadEmails ?? 0} unread`} icon={Inbox} accent="secondary" />
        <StatCard label="Pending Followups" value={stats.data?.pendingFollowups ?? 0} icon={Bell} accent="gold" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border-2 border-border bg-card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Matched today</h3>
            <Link to="/jobs" className="text-xs font-semibold text-primary">See all →</Link>
          </div>
          {jobs.isError ? <Empty title="Jobs could not load" hint="Please refresh or reconnect Firecrawl." /> : jobs.isLoading ? <Skel n={3} /> : (jobs.data?.jobs.length ?? 0) === 0 ? (
            <Empty title="👋 Welcome to OkJobs!" hint="Start by browsing jobs and submitting your first application!" />
          ) : (
            <div className="space-y-3">
              {jobs.data!.jobs.slice(0, 4).map((j: any) => (
                <div key={j.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/50">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-brand text-sm font-extrabold text-white">{j.company[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{j.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{j.company} · {j.location ?? "—"}</div>
                  </div>
                  <span className="text-sm font-extrabold text-primary">{j.ats_score ?? 0}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border-2 border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-lg font-bold">Pipeline</h3>
          <div className="mt-4 space-y-3">
            {STATUSES.map((s) => (
              <div key={s}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{s}</span>
                  <span className="font-bold">{byStatus[s] ?? 0}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${COLORS[s]}`} style={{ width: `${((byStatus[s] ?? 0) / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border-2 border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recruiter inbox</h3>
            <Link to="/recruiter-inbox" className="text-xs font-semibold text-primary">Open inbox →</Link>
          </div>
          {emails.isError ? <Empty title="Inbox could not load" hint="Please refresh or reconnect Gmail." /> : emails.isLoading ? <Skel n={3} /> : (emails.data?.emails.length ?? 0) === 0 ? (
            <Empty title="📧 No recruiter emails yet" hint="Connect Gmail from the Recruiter Inbox page to monitor recruiter replies." />
          ) : (
            <div className="space-y-3">
              {emails.data!.emails.slice(0, 3).map((e: any) => (
                <div key={e.id} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-cool font-bold text-white">{e.company?.[0] ?? "?"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{e.company}</div>
                    <div className="truncate text-sm">{e.subject}</div>
                    <div className="truncate text-xs text-muted-foreground">{e.preview}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/15 to-card p-5">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-gold" />
            <h3 className="text-lg font-bold">Keep the streak</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Apply to 1 job today to keep momentum.</p>
          <div className="mt-4 rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> NEXT</div>
            <div className="mt-1 text-sm">
              {(apps.data?.applications.length ?? 0) === 0
                ? "Add your first application from a matched job."
                : `You have ${stats.data?.pendingFollowups ?? 0} followup${stats.data?.pendingFollowups === 1 ? "" : "s"} pending.`}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Skel({ n }: { n: number }) {
  return <div className="space-y-3">{Array.from({ length: n }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/40" />)}</div>;
}
function Empty({ title, hint }: { title: string; hint: string }) {
  return <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center"><div className="font-semibold">{title}</div><div className="mt-1 text-xs text-muted-foreground">{hint}</div></div>;
}
