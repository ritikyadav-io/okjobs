import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { StatCard } from "@/components/zenith/StatCard";
import { ATSRing } from "@/components/zenith/ATSRing";
import { Briefcase, Calendar, Inbox, Bell, Flame, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { MOCK_JOBS, MOCK_EMAILS, STATUS_META, MOCK_APPS } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Zenith" }, { name: "description", content: "Your job search command center." }] }),
  component: Dashboard,
});

function Dashboard() {
  const pipeline: { label: string; count: number; color: string }[] = [
    { label: "Saved", count: 3, color: "bg-muted-foreground" },
    { label: "Applied", count: 12, color: "bg-primary" },
    { label: "OA", count: 4, color: "bg-gold" },
    { label: "Interview", count: 3, color: "bg-cyan" },
    { label: "Offer", count: 1, color: "bg-success" },
    { label: "Rejected", count: 6, color: "bg-danger" },
  ];
  const max = Math.max(...pipeline.map((p) => p.count));

  return (
    <AppShell>
      <PageHeader
        title="Good morning, Aarav 👋"
        description="Here's what Zenith found while you were sleeping."
        actions={
          <Link to="/jobs" className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">
            Browse jobs <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Applications" value={29} icon={Briefcase} accent="primary" trend="+4 this week" />
        <StatCard label="Interviews Scheduled" value={3} hint="Next: Linear · Tomorrow 3PM" icon={Calendar} accent="cyan" />
        <StatCard label="Recruiter Replies" value={7} hint="2 unread" icon={Inbox} accent="secondary" />
        <StatCard label="Pending Followups" value={4} hint="1 urgent" icon={Bell} accent="gold" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        {/* Recent jobs */}
        <div className="rounded-2xl border-2 border-border bg-card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Matched today</h3>
            <Link to="/jobs" className="text-xs font-semibold text-primary">See all →</Link>
          </div>
          <div className="space-y-3">
            {MOCK_JOBS.slice(0, 4).map((j) => (
              <div key={j.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-all hover:border-primary/50">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${j.logoBg} text-sm font-extrabold text-white`}>
                  {j.company[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{j.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{j.company} · {j.location} · {j.salary}</div>
                </div>
                <ATSRing score={j.atsScore} size={44} />
                <button className="hidden rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow sm:inline-block">Apply</button>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <div className="rounded-2xl border-2 border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-lg font-bold">Pipeline</h3>
          <div className="mt-4 space-y-3">
            {pipeline.map((p) => (
              <div key={p.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{p.label}</span>
                  <span className="font-bold">{p.count}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${p.color} transition-all`} style={{ width: `${(p.count / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Recent emails */}
        <div className="rounded-2xl border-2 border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recruiter inbox</h3>
            <Link to="/recruiter-inbox" className="text-xs font-semibold text-primary">Open inbox →</Link>
          </div>
          <div className="space-y-3">
            {MOCK_EMAILS.slice(0, 3).map((e) => (
              <div key={e.id} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-cool font-bold text-white">{e.company[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{e.company}</span>
                    <EmailBadge type={e.type} />
                  </div>
                  <div className="truncate text-sm">{e.subject}</div>
                  <div className="truncate text-xs text-muted-foreground">{e.preview}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak + tips */}
        <div className="rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/15 to-card p-5">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-gold" />
            <h3 className="text-lg font-bold">7-day streak</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Apply to 1 job today to keep your streak alive.</p>
          <div className="mt-4 rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> ATS TIP</div>
            <div className="mt-1 text-sm">Add <span className="font-semibold">"GraphQL"</span> to your skills — 4 of your saved jobs require it.</div>
          </div>
          <div className="mt-3 rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-success"><CheckCircle2 className="h-3.5 w-3.5" /> NEXT ACTION</div>
            <div className="mt-1 text-sm">Follow up with <span className="font-semibold">Vercel</span> — 5 days no reply.</div>
          </div>
        </div>
      </div>

      {/* Recent apps */}
      <div className="mt-6 rounded-2xl border-2 border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Recent applications</h3>
          <Link to="/applications" className="text-xs font-semibold text-primary">View tracker →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_APPS.slice(0, 6).map((a) => {
            const s = STATUS_META[a.status];
            return (
              <div key={a.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${a.logoBg} font-bold text-white`}>{a.company[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{a.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.company} · {a.appliedDays}d ago</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${s.color}`}>{s.emoji} {a.status}</span>
                  <span className="text-xs font-bold">{a.atsScore}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function EmailBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    "Interview Invite": "bg-cyan/15 text-cyan border-cyan/40",
    "Rejection": "bg-danger/15 text-danger border-danger/40",
    "Follow-up Request": "bg-gold/15 text-gold border-gold/40",
    "Offer": "bg-success/15 text-success border-success/40",
    "Ghost": "bg-muted text-muted-foreground border-border",
  };
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${map[type] ?? ""}`}>{type}</span>;
}
