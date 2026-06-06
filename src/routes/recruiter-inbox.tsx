import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { Mail, RefreshCw, CheckCircle2, Sparkles, Trash2, Search, Archive, ArchiveRestore, Filter, X, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  archiveRecruiterEmail,
  bulkUpdateEmails,
  deleteRecruiterEmail,
  generateSuggestedReply,
  listRecruiterEmails,
  summarizeRecruiterEmail,
  syncRecruiterEmails,
  updateEmailReplyStatus,
} from "@/lib/gmail.functions";
import { toast } from "sonner";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/recruiter-inbox")({
  head: () => ({ meta: [{ title: "Career Inbox — OkJobs" }] }),
  component: InboxPage,
});

const TYPE_COLOR: Record<string, string> = {
  "Interview Invite": "bg-cyan/15 text-cyan border-cyan/40",
  Rejection: "bg-danger/15 text-danger border-danger/40",
  "Follow-up Request": "bg-gold/15 text-gold border-gold/40",
  Offer: "bg-success/15 text-success border-success/40",
  Assessment: "bg-primary/15 text-primary border-primary/40",
  "Application Update": "bg-muted text-muted-foreground border-border",
  Ghost: "bg-muted text-muted-foreground border-border",
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "Interview Invite", label: "Interviews" },
  { id: "Offer", label: "Offers" },
  { id: "Assessment", label: "Assessments" },
  { id: "Follow-up Request", label: "Follow-ups" },
  { id: "Rejection", label: "Rejections" },
  { id: "archived", label: "Archived" },
];

function InboxPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listRecruiterEmails);
  const syncFn = useServerFn(syncRecruiterEmails);
  const updFn = useServerFn(updateEmailReplyStatus);
  const replyFn = useServerFn(generateSuggestedReply);
  const delFn = useServerFn(deleteRecruiterEmail);
  const archFn = useServerFn(archiveRecruiterEmail);
  const bulkFn = useServerFn(bulkUpdateEmails);
  const sumFn = useServerFn(summarizeRecruiterEmail);

  const [reply, setReply] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<Record<string, { summary: string; highlights: string[] }>>({});
  const [summaryErr, setSummaryErr] = useState<Record<string, string>>({});
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useRealtimeRefresh(
    ["recruiter_emails", "applications", "calendar_events"],
    [["emails"], ["applications"], ["events"], ["dashboard-stats"]],
  );

  const emails = useQuery({ queryKey: ["emails"], queryFn: () => listFn(), staleTime: 30_000, placeholderData: (p) => p });

  const sync = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: (r: any) => {
      const removed = r?.removed ? ` · ${r.removed} removed` : "";
      toast.success(`Found ${r.added} new${removed}`);
      qc.invalidateQueries({ queryKey: ["emails"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const upd = useMutation({
    mutationFn: (v: { id: string; status: any }) => updFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emails"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["emails"] });
      const prev = qc.getQueryData<any>(["emails"]);
      qc.setQueryData(["emails"], (old: any) => old ? { ...old, emails: old.emails.filter((e: any) => e.id !== id) } : old);
      return { prev };
    },
    onError: (e: any, _id, ctx: any) => { if (ctx?.prev) qc.setQueryData(["emails"], ctx.prev); toast.error(e.message ?? "Delete failed"); },
    onSuccess: () => toast.success("Email removed"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["emails"] }),
  });
  const arch = useMutation({
    mutationFn: (v: { id: string; archived: boolean }) => archFn({ data: v }),
    onSuccess: (_d, v) => { toast.success(v.archived ? "Archived" : "Restored"); qc.invalidateQueries({ queryKey: ["emails"] }); },
    onError: (e: any) => toast.error(e.message ?? "Archive failed"),
  });
  const bulk = useMutation({
    mutationFn: (v: { ids: string[]; action: any }) => bulkFn({ data: v }),
    onSuccess: (r: any, v) => { toast.success(`${v.action} — ${r.count} email${r.count === 1 ? "" : "s"}`); setSelected(new Set()); qc.invalidateQueries({ queryKey: ["emails"] }); },
    onError: (e: any) => toast.error(e.message ?? "Bulk action failed"),
  });
  const suggested = useMutation({
    mutationFn: (id: string) => replyFn({ data: { emailId: id } }),
    onSuccess: (r, id) => setReply((prev) => ({ ...prev, [id]: r.reply })),
    onError: (e: any) => toast.error(e.message ?? "Could not generate reply"),
  });

  async function onSummarize(id: string) {
    setSummarizingId(id);
    setSummaryErr((p) => { const n = { ...p }; delete n[id]; return n; });
    try {
      const r = await sumFn({ data: { emailId: id } });
      setSummary((prev) => ({ ...prev, [id]: r }));
    } catch (e: any) {
      setSummaryErr((prev) => ({ ...prev, [id]: e?.message ?? "AI summary failed" }));
    } finally {
      setSummarizingId(null);
    }
  }

  const allEmails: any[] = emails.data?.emails ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEmails.filter((e) => {
      if (category === "archived") { if (!e.archived) return false; }
      else { if (e.archived) return false; }
      if (category === "unread" && e.reply_status !== "unread") return false;
      if (!["all", "unread", "archived"].includes(category) && e.type !== category) return false;
      if (q) {
        const hay = `${e.subject ?? ""} ${e.company ?? ""} ${e.sender ?? ""} ${e.preview ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allEmails, category, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0, unread: 0, archived: 0 };
    for (const e of allEmails) {
      if (e.archived) c.archived = (c.archived ?? 0) + 1;
      else {
        c.all++;
        if (e.reply_status === "unread") c.unread++;
        if (e.type) c[e.type] = (c[e.type] ?? 0) + 1;
      }
    }
    return c;
  }, [allEmails]);

  const allSelected = filtered.length > 0 && filtered.every((e) => selected.has(e.id));
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((e) => e.id)));
  }
  function toggleOne(id: string) {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  return (
    <AppShell>
      <PageHeader
        title="Career Inbox"
        description="Interview invites, offers, assessments and recruiter messages — AI-classified and summarized."
        actions={
          <button onClick={() => sync.mutate()} disabled={sync.isPending} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} /> {sync.isPending ? "Syncing…" : "Sync inbox"}
          </button>
        }
      />

      {/* Toolbar */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => {
            const n = counts[c.id] ?? 0;
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${active ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border bg-card hover:bg-accent"}`}
              >
                <Filter className="h-3 w-3 opacity-70" /> {c.label}
                {n > 0 && <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-primary-foreground/20" : "bg-muted"}`}>{n}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-border bg-card p-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company, sender, subject…"
              className="w-full bg-transparent text-sm outline-none"
            />
            {query && <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
          </div>
          {filtered.length > 0 && (
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-[color:var(--primary)]" />
              Select all
            </label>
          )}
        </div>
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-primary/40 bg-primary/5 p-3">
            <span className="text-xs font-bold text-primary">{selected.size} selected</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <button onClick={() => bulk.mutate({ ids: [...selected], action: "read" })} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent">Mark read</button>
              <button onClick={() => bulk.mutate({ ids: [...selected], action: "handled" })} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent">Mark handled</button>
              <button onClick={() => bulk.mutate({ ids: [...selected], action: category === "archived" ? "unarchive" : "archive" })} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent">
                {category === "archived" ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                {category === "archived" ? "Restore" : "Archive"}
              </button>
              <button onClick={() => { if (confirm(`Delete ${selected.size} email${selected.size === 1 ? "" : "s"}?`)) bulk.mutate({ ids: [...selected], action: "delete" }); }} className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
              <button onClick={() => setSelected(new Set())} className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground">Clear</button>
            </div>
          </div>
        )}
      </div>

      {emails.isError ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center"><div className="text-lg font-bold">Career inbox could not load</div><p className="mt-1 text-sm text-muted-foreground">Reconnect Gmail in Settings or try syncing again.</p></div>
      ) : emails.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/40" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="text-lg font-bold">📧 Nothing here yet</div>
          <p className="mt-1 text-sm text-muted-foreground">{query || category !== "all" ? "No emails match this filter." : "Connect Gmail in Settings to surface interview invites, offers and recruiter replies."}</p>
          {!query && category === "all" && <button onClick={() => sync.mutate()} className="mt-4 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">Sync inbox now</button>}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((e: any) => {
            const isSel = selected.has(e.id);
            const sum = summary[e.id];
            const sumErr = summaryErr[e.id];
            const isSummarizing = summarizingId === e.id;
            const cached = (e.ai_summary && Array.isArray(e.ai_highlights)) ? { summary: e.ai_summary as string, highlights: e.ai_highlights as string[] } : null;
            const shown = sum ?? cached;
            return (
              <div key={e.id} className={`rounded-2xl border-2 bg-card p-5 transition-all ${isSel ? "border-primary shadow-glow" : e.reply_status === "unread" ? "border-primary/40" : "border-border"} hover:border-primary/60`}>
                <div className="flex items-start gap-4">
                  <input type="checkbox" checked={isSel} onChange={() => toggleOne(e.id)} className="mt-1.5 h-4 w-4 shrink-0 accent-[color:var(--primary)]" />
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-cool font-bold text-white">{(e.company ?? "?")[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{e.company}</span>
                      <span className="truncate text-xs text-muted-foreground">{e.sender}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{new Date(e.received_at).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_COLOR[e.type] ?? ""}`}>{e.type}</span>
                      <span className="text-sm font-semibold">{e.subject}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{e.preview}</p>

                    {/* AI summary section */}
                    {shown && (
                      <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
                          <Sparkles className="h-3.5 w-3.5" /> AI summary
                        </div>
                        <p className="mt-1.5 text-sm">{shown.summary}</p>
                        {shown.highlights.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {shown.highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {isSummarizing && (
                      <div className="mt-3 rounded-xl border border-border bg-background p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" /> Summarizing with AI…
                        </div>
                        <div className="mt-2 space-y-1.5">
                          <div className="h-2 animate-pulse rounded bg-muted" />
                          <div className="h-2 w-4/5 animate-pulse rounded bg-muted" />
                          <div className="h-2 w-2/3 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    )}
                    {sumErr && !isSummarizing && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <div className="flex-1">{sumErr}</div>
                        <button onClick={() => onSummarize(e.id)} className="rounded-md border border-destructive/40 px-2 py-1 font-semibold hover:bg-destructive/10">Retry</button>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!shown && !isSummarizing && (
                        <button onClick={() => onSummarize(e.id)} className="inline-flex items-center gap-1 rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow">
                          <Sparkles className="h-3.5 w-3.5" /> Summarize
                        </button>
                      )}
                      <button onClick={() => suggested.mutate(e.id)} disabled={suggested.isPending} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent disabled:opacity-60">
                        <Mail className="h-3.5 w-3.5" /> Suggested reply
                      </button>
                      <button onClick={() => upd.mutate({ id: e.id, status: "handled" })} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Handled
                      </button>
                      <button onClick={() => arch.mutate({ id: e.id, archived: !e.archived })} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent">
                        {e.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                        {e.archived ? "Restore" : "Archive"}
                      </button>
                      <button onClick={() => del.mutate(e.id)} className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                      <span className="ml-auto text-[10px] font-bold uppercase text-muted-foreground">{e.reply_status}</span>
                    </div>
                    {reply[e.id] && <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">{reply[e.id]}</pre>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
