import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { MOCK_APPS, STATUS_META, type AppStatus, type Application } from "@/lib/mock-data";
import { useState } from "react";
import { LayoutGrid, List as ListIcon } from "lucide-react";

export const Route = createFileRoute("/applications")({
  head: () => ({ meta: [{ title: "Applications — Zenith" }, { name: "description", content: "Track every application from Saved to Offer." }] }),
  component: ApplicationsPage,
});

const COLUMNS: AppStatus[] = ["Saved", "Applied", "OA Received", "Interview Scheduled", "Offer Received", "Rejected"];

function ApplicationsPage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  return (
    <AppShell>
      <PageHeader
        title="Applications"
        description="Every step from saved to offer."
        actions={
          <div className="inline-flex rounded-lg border-2 border-border bg-card p-1">
            <button onClick={() => setView("kanban")} className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${view === "kanban" ? "bg-gradient-brand text-white shadow-glow" : ""}`}>
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </button>
            <button onClick={() => setView("list")} className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${view === "list" ? "bg-gradient-brand text-white shadow-glow" : ""}`}>
              <ListIcon className="h-3.5 w-3.5" /> List
            </button>
          </div>
        }
      />

      {view === "kanban" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COLUMNS.map((status) => {
            const items = MOCK_APPS.filter((a) => a.status === status);
            const meta = STATUS_META[status];
            return (
              <div key={status} className="rounded-2xl border-2 border-border bg-card p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${meta.color}`}>{meta.emoji} {status}</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground">
                      Nothing here yet
                    </div>
                  ) : items.map((a) => <AppCard key={a.id} a={a} />)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border-2 border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-background text-xs font-bold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">ATS</th>
                <th className="px-4 py-3 text-left">Applied</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_APPS.map((a) => {
                const m = STATUS_META[a.status];
                return (
                  <tr key={a.id} className="border-t border-border hover:bg-accent/30">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className={`grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br ${a.logoBg} text-xs font-bold text-white`}>{a.company[0]}</div>{a.company}</div></td>
                    <td className="px-4 py-3 font-semibold">{a.title}</td>
                    <td className="px-4 py-3"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${m.color}`}>{m.emoji} {a.status}</span></td>
                    <td className="px-4 py-3 font-bold">{a.atsScore}%</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.appliedDays}d ago</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function AppCard({ a }: { a: Application }) {
  return (
    <div className="cursor-pointer rounded-xl border border-border bg-background p-3 transition-all hover:border-primary/50">
      <div className="flex items-center gap-2">
        <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${a.logoBg} text-xs font-extrabold text-white`}>{a.company[0]}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{a.title}</div>
          <div className="truncate text-xs text-muted-foreground">{a.company}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{a.appliedDays}d ago</span>
        <span className="font-bold">{a.atsScore}%</span>
      </div>
      {a.interviewIn != null && (
        <div className="mt-2 rounded-md bg-cyan/15 px-2 py-1 text-[11px] font-semibold text-cyan">
          🎯 Interview in {a.interviewIn}d
        </div>
      )}
      {a.followupIn != null && (
        <div className="mt-2 rounded-md bg-gold/15 px-2 py-1 text-[11px] font-semibold text-gold">
          🔔 Follow up in {a.followupIn}d
        </div>
      )}
    </div>
  );
}
