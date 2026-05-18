import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { LayoutGrid, List as ListIcon, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listApplications, createApplication, updateApplicationStatus, deleteApplication } from "@/lib/applications.functions";
import { toast } from "sonner";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export const Route = createFileRoute("/applications")({
  head: () => ({ meta: [{ title: "Applications — Zenith" }] }),
  component: ApplicationsPage,
});

const COLUMNS = ["Saved", "Applied", "OA Received", "Interview Scheduled", "Offer Received", "Rejected"] as const;
const META: Record<string, { color: string; emoji: string }> = {
  Saved: { color: "bg-muted text-muted-foreground border-border", emoji: "💾" },
  Applied: { color: "bg-primary/15 text-primary border-primary/40", emoji: "✅" },
  "OA Received": { color: "bg-gold/15 text-gold border-gold/40", emoji: "📋" },
  "Interview Scheduled": { color: "bg-cyan/20 text-cyan border-cyan/50", emoji: "🎯" },
  Rejected: { color: "bg-danger/15 text-danger border-danger/40", emoji: "❌" },
  "Offer Received": { color: "bg-success/15 text-success border-success/40", emoji: "🎉" },
};

function ApplicationsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listApplications);
  const createFn = useServerFn(createApplication);
  const updFn = useServerFn(updateApplicationStatus);
  const delFn = useServerFn(deleteApplication);
  useRealtimeRefresh(["applications"], [["applications"], ["dashboard-stats"]]);

  const apps = useQuery({ queryKey: ["applications"], queryFn: () => listFn(), staleTime: 30_000, placeholderData: (p) => p });
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ company: "", title: "" });

  const create = useMutation({
    mutationFn: () => createFn({ data: form }),
    onSuccess: () => { toast.success("Application added"); setShowAdd(false); setForm({ company: "", title: "" }); qc.invalidateQueries({ queryKey: ["applications"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: (v: { id: string; status: any }) => updFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["applications"] }); },
  });

  const items = apps.data?.applications ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Applications"
        description="Track every step from saved to offer."
        actions={
          <div className="flex gap-2">
            <button onClick={() => setShowAdd((s) => !s)} className="inline-flex items-center gap-1 rounded-lg bg-gradient-brand px-3 py-2 text-sm font-semibold text-white shadow-glow"><Plus className="h-4 w-4" /> Add</button>
            <div className="inline-flex rounded-lg border-2 border-border bg-card p-1">
              <button onClick={() => setView("kanban")} className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${view === "kanban" ? "bg-gradient-brand text-white shadow-glow" : ""}`}><LayoutGrid className="h-3.5 w-3.5" /> Kanban</button>
              <button onClick={() => setView("list")} className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${view === "list" ? "bg-gradient-brand text-white shadow-glow" : ""}`}><ListIcon className="h-3.5 w-3.5" /> List</button>
            </div>
          </div>
        }
      />

      {showAdd && (
        <form onSubmit={(e) => { e.preventDefault(); if (form.company && form.title) create.mutate(); }} className="mb-5 grid gap-3 rounded-2xl border-2 border-primary/40 bg-card p-4 md:grid-cols-3">
          <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Role title" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <button type="submit" disabled={create.isPending} className="rounded-lg bg-gradient-brand py-2 text-sm font-semibold text-white">Add</button>
        </form>
      )}

      {apps.isError ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center"><div className="text-lg font-bold">Applications could not load</div><p className="mt-1 text-sm text-muted-foreground">Please refresh and try again.</p></div>
      ) : apps.isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="text-lg font-bold">📋 No applications yet!</div>
          <p className="mt-1 text-sm text-muted-foreground">Browse jobs and click Apply to track your first application.</p>
        </div>
      ) : view === "kanban" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COLUMNS.map((status) => {
            const col = items.filter((a: any) => a.status === status);
            const m = META[status];
            return (
              <div key={status} className="rounded-2xl border-2 border-border bg-card p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${m.color}`}>{m.emoji} {status}</span>
                  <span className="text-xs font-bold text-muted-foreground">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground">Nothing here</div>
                  ) : col.map((a: any) => (
                    <div key={a.id} className="rounded-xl border border-border bg-background p-3">
                      <div className="text-sm font-semibold">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.company}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <select value={a.status} onChange={(e) => update.mutate({ id: a.id, status: e.target.value })} className="rounded-md border border-border bg-card px-1 py-0.5 text-[10px]">
                          {COLUMNS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={() => del.mutate(a.id)} className="text-[10px] text-danger hover:underline">delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border-2 border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-background text-xs font-bold uppercase text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Company</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">ATS</th><th /></tr>
            </thead>
            <tbody>
              {items.map((a: any) => (
                <tr key={a.id} className="border-t border-border hover:bg-accent/30">
                  <td className="px-4 py-3">{a.company}</td>
                  <td className="px-4 py-3 font-semibold">{a.title}</td>
                  <td className="px-4 py-3">
                    <select value={a.status} onChange={(e) => update.mutate({ id: a.id, status: e.target.value })} className="rounded-md border border-border bg-card px-2 py-0.5 text-xs">
                      {COLUMNS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 font-bold">{a.ats_score ?? 0}%</td>
                  <td className="px-4 py-3"><button onClick={() => del.mutate(a.id)} className="text-xs text-danger hover:underline">delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
