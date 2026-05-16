import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { MOCK_EMAILS } from "@/lib/mock-data";
import { Mail, Reply, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/recruiter-inbox")({
  head: () => ({ meta: [{ title: "Recruiter Inbox — Zenith" }, { name: "description", content: "Gmail-monitored recruiter emails, auto-classified." }] }),
  component: InboxPage,
});

function InboxPage() {
  return (
    <AppShell>
      <PageHeader title="Recruiter Inbox" description="Gmail-monitored every 15 minutes. Auto-classified." />

      <div className="grid gap-4">
        {MOCK_EMAILS.map((e) => {
          const map: Record<string, string> = {
            "Interview Invite": "bg-cyan/15 text-cyan border-cyan/40",
            "Rejection": "bg-danger/15 text-danger border-danger/40",
            "Follow-up Request": "bg-gold/15 text-gold border-gold/40",
            "Offer": "bg-success/15 text-success border-success/40",
            "Ghost": "bg-muted text-muted-foreground border-border",
          };
          return (
            <div key={e.id} className="rounded-2xl border-2 border-border bg-card p-5 transition-all hover:border-primary/50">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-cool font-bold text-white">{e.company[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{e.company}</span>
                    <span className="text-xs text-muted-foreground">{e.sender}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{e.hoursAgo}h ago</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${map[e.type]}`}>{e.type}</span>
                    <span className="text-sm font-semibold">{e.subject}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{e.preview}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="inline-flex items-center gap-1 rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow"><Reply className="h-3.5 w-3.5" /> Suggested reply</button>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"><Mail className="h-3.5 w-3.5" /> Open in Gmail</button>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"><CheckCircle2 className="h-3.5 w-3.5" /> Mark handled</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
