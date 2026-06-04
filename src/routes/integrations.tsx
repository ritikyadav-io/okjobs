import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listConnectorRuns, verifyConnector, runConnectorNow } from "@/lib/connectors.functions";
import { getSheetSettings, syncSheetNow } from "@/lib/sheets.functions";
import { CheckCircle2, XCircle, Loader2, PlayCircle, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [{ title: "Integrations — OkJobs" }] }),
  component: IntegrationsPage,
});

type ConnectorRow = {
  key: string;
  label: string;
  description: string;
  verifyName: "supabase" | "gmail" | "calendar" | "docs" | "sheets" | "resend" | "firecrawl";
  runName?: "gmail" | "scrape_jobs" | "calendar" | "briefing";
  matchConnectors: string[];
};

const ROWS: ConnectorRow[] = [
  { key: "supabase", label: "Database", description: "User data, jobs, applications, realtime", verifyName: "supabase", matchConnectors: ["supabase"] },
  { key: "firecrawl", label: "Job Discovery Engine", description: "Aggregates LinkedIn, Indeed, Naukri, Internshala and 1000s of company pages.", verifyName: "firecrawl", runName: "scrape_jobs", matchConnectors: ["firecrawl"] },
  { key: "gmail", label: "Gmail Sync", description: "Auto-classify recruiter emails every 15 min", verifyName: "gmail", runName: "gmail", matchConnectors: ["gmail"] },
  { key: "calendar", label: "Google Calendar", description: "Interview events + follow-up reminders", verifyName: "calendar", runName: "calendar", matchConnectors: ["calendar"] },
  { key: "docs", label: "Google Docs Export", description: "Resume & cover letter export", verifyName: "docs", matchConnectors: ["docs"] },
  { key: "sheets", label: "Google Sheets", description: "Mirror applications to a spreadsheet", verifyName: "sheets", matchConnectors: ["sheets"] },
  { key: "resend", label: "Resend — Daily Briefing", description: "Email briefing at 8 AM daily", verifyName: "resend", runName: "briefing", matchConnectors: ["resend"] },
];

function IntegrationsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listConnectorRuns);
  const verifyFn = useServerFn(verifyConnector);
  const runFn = useServerFn(runConnectorNow);
  useRealtimeRefresh(["connector_runs", "sheet_settings"], [["connector-runs"], ["sheet-settings"]]);

  const runs = useQuery({ queryKey: ["connector-runs"], queryFn: () => listFn(), staleTime: 15_000 });
  const sheetSettingsFn = useServerFn(getSheetSettings);
  const sheets = useQuery({ queryKey: ["sheet-settings"], queryFn: () => sheetSettingsFn(), staleTime: 15_000 });
  const syncSheetFn = useServerFn(syncSheetNow);

  const verify = useMutation({
    mutationFn: (name: ConnectorRow["verifyName"]) => verifyFn({ data: { name } }),
    onSuccess: (r) => { toast.success(`Verified: ${r.message}`); qc.invalidateQueries({ queryKey: ["connector-runs"] }); },
    onError: (e: any) => toast.error(e.message ?? "Verification failed"),
  });
  const runNow = useMutation({
    mutationFn: (name: NonNullable<ConnectorRow["runName"]>) => runFn({ data: { name } }),
    onSuccess: (r) => { toast.success(`Done: ${r.message}`); qc.invalidateQueries(); },
    onError: (e: any) => toast.error(e.message ?? "Run failed"),
  });
  const syncSheets = useMutation({
    mutationFn: () => syncSheetFn(),
    onSuccess: (r: any) => { toast.success(`Synced ${r.rows} rows`); qc.invalidateQueries(); },
    onError: (e: any) => toast.error(e.message ?? "Sheets sync failed"),
  });

  const allRuns = runs.data?.runs ?? [];
  const latestByConnector = new Map<string, any>();
  for (const r of allRuns) {
    for (const c of [r.connector]) {
      if (!latestByConnector.has(c)) latestByConnector.set(c, r);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Integrations"
        description="Health, verification, and manual runs for every connector"
      />

      <div className="grid gap-4">
        {ROWS.map((row) => {
          const latest = row.matchConnectors.map((c) => latestByConnector.get(c)).find(Boolean);
          const ok = latest?.status === "ok";
          const isVerifying = verify.isPending && verify.variables === row.verifyName;
          const isRunning = runNow.isPending && runNow.variables === row.runName;

          return (
            <div key={row.key} className="rounded-2xl border-2 border-border bg-card p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${ok ? "bg-success/20 text-success" : latest ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"}`}>
                  {ok ? <CheckCircle2 className="h-5 w-5" /> : latest ? <XCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-base font-bold">{row.label}</div>
                  <div className="text-sm text-muted-foreground">{row.description}</div>
                  {latest && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last {latest.kind}: <span className={ok ? "text-success" : "text-destructive"}>{latest.status}</span>
                      {" · "}{new Date(latest.ran_at).toLocaleString()} {latest.duration_ms ? `· ${latest.duration_ms}ms` : ""}
                      {latest.message && <div className="mt-1 truncate text-muted-foreground/80">{latest.message}</div>}
                    </div>
                  )}
                  {row.key === "sheets" && sheets.data?.settings && (
                    <div className="mt-2 rounded-lg border border-border bg-background/60 p-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Sheet:</span>{" "}
                        <span className="font-mono">{sheets.data.settings.spreadsheet_id?.slice(0, 14)}…</span>
                        {" · "}{sheets.data.settings.sheet_name}
                      </div>
                      {sheets.data.settings.last_sync_at && (
                        <div className="mt-0.5">
                          <span className="text-muted-foreground">Last sync:</span>{" "}
                          {new Date(sheets.data.settings.last_sync_at).toLocaleString()}
                          {typeof sheets.data.settings.last_row_count === "number" && ` · ${sheets.data.settings.last_row_count} rows`}
                        </div>
                      )}
                      {sheets.data.settings.last_error && (
                        <div className="mt-0.5 text-destructive">⚠ {sheets.data.settings.last_error}</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => verify.mutate(row.verifyName)}
                    disabled={isVerifying}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-60"
                  >
                    {isVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    Verify
                  </button>
                  {row.key === "sheets" && (
                    <>
                      <Link to="/settings" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent">
                        Configure
                      </Link>
                      <button
                        onClick={() => syncSheets.mutate()}
                        disabled={syncSheets.isPending || !sheets.data?.settings?.spreadsheet_id}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3 py-2 text-xs font-semibold text-white shadow-glow disabled:opacity-60"
                      >
                        {syncSheets.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Sync now
                      </button>
                    </>
                  )}
                  {row.runName && (
                    <button
                      onClick={() => runNow.mutate(row.runName!)}
                      disabled={isRunning}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3 py-2 text-xs font-semibold text-white shadow-glow disabled:opacity-60"
                    >
                      {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                      Run now
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Recent activity</h2>
        <div className="overflow-hidden rounded-2xl border-2 border-border bg-card">
          {allRuns.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No runs yet. Hit Verify or Run now above.</div>
          ) : (
            <div className="divide-y divide-border">
              {allRuns.slice(0, 30).map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 text-sm">
                  {r.status === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                  <span className="w-24 truncate font-mono text-xs uppercase text-muted-foreground">{r.connector}</span>
                  <span className="w-16 text-xs uppercase text-muted-foreground">{r.kind}</span>
                  <span className="min-w-0 flex-1 truncate">{r.message || "—"}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(r.ran_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
