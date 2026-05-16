import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { Mail, RefreshCw, CheckCircle2, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateSuggestedReply, listRecruiterEmails, syncRecruiterEmails, updateEmailReplyStatus } from "@/lib/gmail.functions";
import { toast } from "sonner";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { useState } from "react";

export const Route = createFileRoute("/recruiter-inbox")({
  head: () => ({ meta: [{ title: "Recruiter Inbox — Zenith" }] }),
  component: InboxPage,
});

const TYPE_COLOR: Record<string, string> = {
  "Interview Invite": "bg-cyan/15 text-cyan border-cyan/40",
  Rejection: "bg-danger/15 text-danger border-danger/40",
  "Follow-up Request": "bg-gold/15 text-gold border-gold/40",
  Offer: "bg-success/15 text-success border-success/40",
  Ghost: "bg-muted text-muted-foreground border-border",
};

function InboxPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listRecruiterEmails);
  const syncFn = useServerFn(syncRecruiterEmails);
  const updFn = useServerFn(updateEmailReplyStatus);
  const replyFn = useServerFn(generateSuggestedReply);
  const [reply, setReply] = useState<Record<string, string>>({});
  useRealtimeRefresh(["recruiter_emails", "applications", "calendar_events"], [["emails"], ["applications"], ["events"], ["dashboard-stats"]]);

  const emails = useQuery({ queryKey: ["emails"], queryFn: () => listFn() });
  const sync = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: (r) => { toast.success(`Found ${r.added} new emails`); qc.invalidateQueries({ queryKey: ["emails"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const upd = useMutation({
    mutationFn: (v: { id: string; status: any }) => updFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emails"] }),
  });
  const suggested = useMutation({
    mutationFn: (id: string) => replyFn({ data: { emailId: id } }),
    onSuccess: (r, id) => setReply((prev) => ({ ...prev, [id]: r.reply })),
    onError: (e: any) => toast.error(e.message ?? "Could not generate reply"),
  });

  const items = emails.data?.emails ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Recruiter Inbox"
        description="Gmail-synced and auto-classified."
        actions={
          <button onClick={() => sync.mutate()} disabled={sync.isPending} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} /> {sync.isPending ? "Syncing…" : "Sync Gmail"}
          </button>
        }
      />

      {emails.isError ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center"><div className="text-lg font-bold">Recruiter inbox could not load</div><p className="mt-1 text-sm text-muted-foreground">Reconnect Gmail or try syncing again.</p></div>
      ) : emails.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/40" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="text-lg font-bold">📧 No recruiter emails yet</div>
          <p className="mt-1 text-sm text-muted-foreground">Connect your Gmail account to automatically monitor recruiter replies and interview invites.</p>
          <button onClick={() => sync.mutate()} className="mt-4 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">Connect Gmail / Sync now</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((e: any) => (
            <div key={e.id} className={`rounded-2xl border-2 bg-card p-5 transition-all hover:border-primary/50 ${e.reply_status === "unread" ? "border-primary/40" : "border-border"}`}>
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-cool font-bold text-white">{(e.company ?? "?")[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{e.company}</span>
                    <span className="text-xs text-muted-foreground">{e.sender}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(e.received_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_COLOR[e.type] ?? ""}`}>{e.type}</span>
                    <span className="text-sm font-semibold">{e.subject}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{e.preview}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => suggested.mutate(e.id)} className="inline-flex items-center gap-1 rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow"><Sparkles className="h-3.5 w-3.5" /> Suggested reply</button>
                    <button onClick={() => upd.mutate({ id: e.id, status: "replied" })} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"><Mail className="h-3.5 w-3.5" /> Mark replied</button>
                    <button onClick={() => upd.mutate({ id: e.id, status: "handled" })} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"><CheckCircle2 className="h-3.5 w-3.5" /> Mark handled</button>
                    <span className="ml-auto text-[10px] font-bold uppercase text-muted-foreground">{e.reply_status}</span>
                  </div>
                  {reply[e.id] && <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">{reply[e.id]}</pre>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
