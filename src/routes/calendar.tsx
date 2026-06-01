import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { RefreshCw, Calendar as CalIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listEvents, syncCalendar } from "@/lib/calendar.functions";
import { toast } from "sonner";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — OkJobs" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listEvents);
  const syncFn = useServerFn(syncCalendar);
  useRealtimeRefresh(["calendar_events", "applications"], [["events"], ["applications"], ["dashboard-stats"]]);
  const events = useQuery({ queryKey: ["events"], queryFn: () => listFn(), staleTime: 30_000, placeholderData: (p) => p });
  const sync = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: (r) => { toast.success(`Synced ${r.added} new events`); qc.invalidateQueries({ queryKey: ["events"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const items = events.data?.events ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Calendar"
        description="Synced from Google Calendar."
        actions={
          <button onClick={() => sync.mutate()} disabled={sync.isPending} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} /> {sync.isPending ? "Syncing…" : "Sync calendar"}
          </button>
        }
      />
      {events.isError ? <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center"><div className="text-lg font-bold">Calendar could not load</div><p className="text-sm text-muted-foreground">Reconnect Google Calendar or try again.</p></div> : events.isLoading ? <div className="h-64 animate-pulse rounded-2xl bg-muted/40" /> : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <CalIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <div className="mt-2 text-lg font-bold">📅 No interviews scheduled yet</div>
          <p className="text-sm text-muted-foreground">When recruiters send interview invites to your Gmail, they'll automatically appear here! 💪 Keep applying — they're coming!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((e: any) => (
            <div key={e.id} className="rounded-2xl border-2 border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(e.starts_at).toLocaleString()}{e.ends_at ? ` → ${new Date(e.ends_at).toLocaleTimeString()}` : ""}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
