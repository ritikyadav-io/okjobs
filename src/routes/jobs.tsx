import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { ATSRing } from "@/components/zenith/ATSRing";
import { MapPin, Wifi, Building2, Bookmark, ExternalLink, RefreshCw, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listJobs, saveJob } from "@/lib/jobs.functions";
import { enqueueTask } from "@/lib/queue.functions";
import { generateResumeForJob } from "@/lib/resume.functions";
import { toast } from "sonner";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Jobs — OkJobs" }] }),
  component: JobsPage,
});

function JobsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listJobs);
  const enqueueFn = useServerFn(enqueueTask);
  const saveFn = useServerFn(saveJob);
  const genFn = useServerFn(generateResumeForJob);
  useRealtimeRefresh(["jobs", "applications", "job_queue"], [["jobs"], ["applications"], ["dashboard-stats"], ["queue"]]);

  const [genId, setGenId] = useState<string | null>(null);

  const [minATS, setMinATS] = useState(0);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [query, setQuery] = useState("");

  const jobs = useQuery({ queryKey: ["jobs"], queryFn: () => listFn(), staleTime: 20_000 });

  const scrape = useMutation({
    mutationFn: (q: string) => enqueueFn({ data: { task: "scrape_jobs", payload: { query: q, limit: 80 } } }),
    onSuccess: () => toast.success("Scrape queued — new jobs will appear here live."),
    onError: (e: any) => toast.error(e.message ?? "Failed to queue scrape"),
  });
  const save = useMutation({
    mutationFn: (id: string) => saveFn({ data: { jobId: id } }),
    onSuccess: () => { toast.success("Saved to Applications"); qc.invalidateQueries({ queryKey: ["applications"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });
  const generate = useMutation({
    mutationFn: (id: string) => { setGenId(id); return genFn({ data: { jobId: id } }); },
    onSuccess: (r: any) => { setGenId(null); toast.success(`ATS resume ready — ${r.title} (score ${r.atsScore}%)`); qc.invalidateQueries({ queryKey: ["resume-versions"] }); },
    onError: (e: any) => { setGenId(null); toast.error(e.message ?? "Resume generation failed"); },
  });


  const items = (jobs.data?.jobs ?? []).filter((j: any) =>
    (j.ats_score ?? 0) >= minATS && (!remoteOnly || j.remote === "Remote"),
  );

  return (
    <AppShell>
      <PageHeader
        title="Jobs"
        description={`${items.length} matches`}
        actions={
          <button
            onClick={() => scrape.mutate(query || "software engineer remote")}
            disabled={scrape.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${scrape.isPending ? "animate-spin" : ""}`} /> {scrape.isPending ? "Queuing…" : "Scrape jobs"}
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-border bg-card p-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. backend engineer remote"
            className="w-full bg-transparent text-sm outline-none"
            onKeyDown={(e) => { if (e.key === "Enter") scrape.mutate(query || "software engineer remote"); }}
          />
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} className="h-4 w-4 accent-[color:var(--primary)]" />
          Remote only
        </label>
        <div className="flex items-center gap-2 text-xs font-semibold">
          Min ATS: <span className="font-extrabold text-primary">{minATS}%</span>
          <input type="range" min={0} max={100} value={minATS} onChange={(e) => setMinATS(Number(e.target.value))} />
        </div>
      </div>

      {jobs.isError ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center"><div className="text-lg font-bold">Jobs could not load</div><p className="mt-1 text-sm text-muted-foreground">Reconnect Firecrawl or try again.</p></div>
      ) : jobs.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted/40" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="text-lg font-bold">🔍 No jobs loaded yet</div>
          <p className="mt-1 text-sm text-muted-foreground">Connect Firecrawl to automatically discover real jobs matching your profile every 6 hours.</p>
          <button onClick={() => scrape.mutate(query || "software engineer remote")} className="mt-4 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">Connect Firecrawl / Refresh</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((j: any) => (
            <div key={j.id} className="group flex flex-col rounded-2xl border-2 border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-brand text-base font-extrabold text-white">{j.company[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-muted-foreground">{j.company}</div>
                  <div className="truncate text-base font-bold">{j.title}</div>
                </div>
                <ATSRing score={j.ats_score ?? 0} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {j.location && <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5"><MapPin className="h-3 w-3" />{j.location}</span>}
                {j.remote && <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5"><Wifi className="h-3 w-3" />{j.remote}</span>}
                {j.source && <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5"><Building2 className="h-3 w-3" />{j.source}</span>}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => save.mutate(j.id)} disabled={save.isPending} className="flex-1 rounded-lg bg-gradient-brand py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60">Save & track</button>
                <a href={j.url} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-accent" title="Open posting"><ExternalLink className="h-4 w-4" /></a>
                <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-accent" title="Bookmark"><Bookmark className="h-4 w-4" /></button>
              </div>
              <button
                onClick={() => generate.mutate(j.id)}
                disabled={generate.isPending}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary/40 bg-primary/5 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-60"
              >
                <Sparkles className={`h-3.5 w-3.5 ${genId === j.id ? "animate-pulse" : ""}`} />
                {genId === j.id ? "Generating ATS resume…" : "Generate ATS Resume"}
              </button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
