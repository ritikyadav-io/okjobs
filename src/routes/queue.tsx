import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listQueue, retryQueueJob, cancelQueueJob, clearQueueDlq, enqueueTask } from "@/lib/queue.functions";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { toast } from "sonner";
import { RotateCw, X, Trash2, Play, AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/queue")({
  head: () => ({ meta: [{ title: "Job Queue — OkJobs" }] }),
  component: QueuePage,
});

const TASK_LABELS: Record<string, string> = {
  scrape_jobs: "Scrape jobs",
  gmail_sync: "Gmail sync",
  calendar_sync: "Calendar sync",
  sheets_sync: "Google Sheets sync",
  daily_briefing: "Daily briefing",
  followup_reminders: "Follow-up reminders",
};

function statusStyle(s: string) {
  switch (s) {
    case "pending": return { c: "text-muted-foreground bg-muted/40", I: Clock };
    case "running": return { c: "text-cyan bg-cyan/15", I: Loader2, spin: true };
    case "done": return { c: "text-success bg-success/15", I: CheckCircle2 };
    case "dlq": return { c: "text-destructive bg-destructive/15", I: AlertTriangle };
    case "cancelled": return { c: "text-muted-foreground bg-muted/40 line-through", I: X };
    default: return { c: "text-muted-foreground bg-muted/40", I: Clock };
  }
}

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.round(s)}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

function QuickEnqueue() {
  const qc = useQueryClient();
  const enqueue = useServerFn(enqueueTask);
  const m = useMutation({
    mutationFn: (task: string) => enqueue({ data: { task: task as any } }),
    onSuccess: (_d, task) => { toast.success(`Queued: ${TASK_LABELS[task] ?? task}`); qc.invalidateQueries({ queryKey: ["queue"] }); },
    onError: (e: any) => toast.error(e.message ?? "Failed to queue"),
  });
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(TASK_LABELS).map(([k, label]) => (
        <button
          key={k}
          disabled={m.isPending}
          onClick={() => m.mutate(k)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary/50 hover:bg-accent disabled:opacity-50"
        >
          <Play className="h-3 w-3" /> {label}
        </button>
      ))}
    </div>
  );
}

function QueuePage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listQueue);
  const retryFn = useServerFn(retryQueueJob);
  const cancelFn = useServerFn(cancelQueueJob);
  const clearFn = useServerFn(clearQueueDlq);
  useRealtimeRefresh(["job_queue"], [["queue"]]);

  const [filter, setFilter] = useState<string>("all");
  const q = useQuery({ queryKey: ["queue"], queryFn: () => listFn(), refetchInterval: 5000 });

  const retry = useMutation({
    mutationFn: (id: string) => retryFn({ data: { id } }),
    onSuccess: () => { toast.success("Re-queued"); qc.invalidateQueries({ queryKey: ["queue"] }); },
    onError: (e: any) => toast.error(e.message ?? "Retry failed"),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => { toast.success("Cancelled"); qc.invalidateQueries({ queryKey: ["queue"] }); },
    onError: (e: any) => toast.error(e.message ?? "Cancel failed"),
  });
  const clearDlq = useMutation({
    mutationFn: () => clearFn(),
    onSuccess: () => { toast.success("DLQ cleared"); qc.invalidateQueries({ queryKey: ["queue"] }); },
    onError: (e: any) => toast.error(e.message ?? "Clear failed"),
  });

  const jobs = q.data?.jobs ?? [];
  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, running: 0, done: 0, dlq: 0, cancelled: 0 };
    for (const j of jobs) c[j.status] = (c[j.status] ?? 0) + 1;
    return c;
  }, [jobs]);

  const filtered = filter === "all" ? jobs : jobs.filter((j: any) => j.status === filter);

  return (
    <AppShell>
      <PageHeader
        title="Job Queue"
        description="Background tasks · retries, backoff, DLQ"
        actions={
          counts.dlq > 0 ? (
            <button
              onClick={() => clearDlq.mutate()}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Clear DLQ ({counts.dlq})
            </button>
          ) : null
        }
      />

      <div className="mb-5 rounded-2xl border-2 border-border bg-card p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Run now</div>
        <QuickEnqueue />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "running", "done", "dlq", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === s ? "bg-gradient-brand text-white shadow-glow" : "border border-border bg-card hover:bg-accent"
            }`}
          >
            {s} {s !== "all" && counts[s] ? `(${counts[s]})` : ""}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {q.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/40" />)
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No queued tasks. Click "Run now" above to enqueue one.
          </div>
        ) : (
          filtered.map((j: any) => {
            const st = statusStyle(j.status);
            const Icon = st.I;
            return (
              <div key={j.id} className="rounded-xl border-2 border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${st.c}`}>
                    <Icon className={`h-3 w-3 ${st.spin ? "animate-spin" : ""}`} /> {j.status}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{TASK_LABELS[j.task] ?? j.task}</div>
                    <div className="text-xs text-muted-foreground">
                      Attempt {j.attempts}/{j.max_attempts} · queued {timeAgo(j.created_at)}
                      {j.started_at && ` · started ${timeAgo(j.started_at)}`}
                      {j.finished_at && ` · finished ${timeAgo(j.finished_at)}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {j.status === "pending" && (
                      <button onClick={() => cancel.mutate(j.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent" title="Cancel">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {(j.status === "dlq" || j.status === "done" || j.status === "cancelled") && (
                      <button onClick={() => retry.mutate(j.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent" title="Retry">
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {j.status === "running" && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-brand transition-all" style={{ width: `${Math.max(5, j.progress ?? 0)}%` }} />
                  </div>
                )}
                {j.last_error && (
                  <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                    {j.last_error}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
