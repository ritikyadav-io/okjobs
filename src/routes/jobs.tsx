import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { ATSRing } from "@/components/zenith/ATSRing";
import { Bookmark, ExternalLink, MapPin, Wifi, Building2, SlidersHorizontal } from "lucide-react";
import { MOCK_JOBS, type Job } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Jobs — Zenith" }, { name: "description", content: "AI-ranked job discovery from LinkedIn, YC, AngelList, Internshala." }] }),
  component: JobsPage,
});

function JobsPage() {
  const [minATS, setMinATS] = useState(0);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const filtered = MOCK_JOBS.filter((j) => j.atsScore >= minATS && (!remoteOnly || j.remote === "Remote"));

  return (
    <AppShell>
      <PageHeader
        title="Jobs"
        description={`${filtered.length} matches · auto-scraped every 6 hours`}
        actions={
          <button className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        }
      />

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-border bg-card p-4">
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} className="h-4 w-4 accent-[color:var(--primary)]" />
          Remote only
        </label>
        <div className="flex items-center gap-2 text-xs font-semibold">
          Min ATS: <span className="font-extrabold text-primary">{minATS}%</span>
          <input type="range" min={0} max={100} value={minATS} onChange={(e) => setMinATS(Number(e.target.value))} className="accent-[color:var(--primary)]" />
        </div>
        <div className="ml-auto flex gap-1">
          {(["Today", "Week", "Month"] as const).map((p) => (
            <button key={p} className="rounded-lg border border-border px-3 py-1 text-xs font-semibold hover:bg-accent">{p}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((j) => <JobCard key={j.id} job={j} />)}
      </div>
    </AppShell>
  );
}

function JobCard({ job }: { job: Job }) {
  const compColor: Record<string, string> = {
    Low: "bg-success/15 text-success border-success/40",
    Medium: "bg-gold/15 text-gold border-gold/40",
    High: "bg-danger/15 text-danger border-danger/40",
  };
  const recColor: Record<string, string> = {
    "Strong Apply": "bg-gradient-brand text-white",
    "Apply": "border border-primary/40 text-primary",
    "Skip": "border border-border text-muted-foreground",
  };
  return (
    <div className="group flex flex-col rounded-2xl border-2 border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow">
      <div className="flex items-start gap-3">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${job.logoBg} text-base font-extrabold text-white`}>
          {job.company[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-muted-foreground">{job.company}</div>
          <div className="truncate text-base font-bold">{job.title}</div>
        </div>
        <ATSRing score={job.atsScore} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5"><MapPin className="h-3 w-3" />{job.location}</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5"><Wifi className="h-3 w-3" />{job.remote}</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5"><Building2 className="h-3 w-3" />{job.source}</span>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-extrabold text-gradient-brand">{job.salary}</span>
        <span className="text-xs text-muted-foreground">{job.postedDays}d ago</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${compColor[job.competition]}`}>
          {job.competition} competition
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${recColor[job.recommendation]}`}>
          {job.recommendation}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 rounded-lg bg-gradient-brand py-2 text-sm font-semibold text-white shadow-glow">Apply</button>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-accent" aria-label="Save"><Bookmark className="h-4 w-4" /></button>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-accent" aria-label="Quick view"><ExternalLink className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
