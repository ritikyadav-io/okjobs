import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { Sunrise, Mail, RefreshCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLatestBriefing, generateBriefing, sendBriefingEmail } from "@/lib/briefing.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/briefing")({
  head: () => ({ meta: [{ title: "Daily Briefing — Zenith" }] }),
  component: BriefingPage,
});

function BriefingPage() {
  const qc = useQueryClient();
  const getFn = useServerFn(getLatestBriefing);
  const genFn = useServerFn(generateBriefing);
  const mailFn = useServerFn(sendBriefingEmail);

  const briefing = useQuery({ queryKey: ["briefing"], queryFn: () => getFn() });
  const gen = useMutation({
    mutationFn: () => genFn(),
    onSuccess: () => { toast.success("Briefing regenerated"); qc.invalidateQueries({ queryKey: ["briefing"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const mail = useMutation({
    mutationFn: () => mailFn(),
    onSuccess: () => toast.success("Briefing sent to your email"),
    onError: (e: any) => toast.error(e.message),
  });

  const d = briefing.data?.briefing?.data ?? null;

  return (
    <AppShell>
      <PageHeader
        title="Daily Briefing"
        description="Your AI-curated overview of yesterday."
        actions={
          <div className="flex gap-2">
            <button onClick={() => gen.mutate()} disabled={gen.isPending} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold">
              <RefreshCw className={`h-4 w-4 ${gen.isPending ? "animate-spin" : ""}`} /> Regenerate
            </button>
            <button onClick={() => mail.mutate()} disabled={mail.isPending} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3 py-2 text-sm font-semibold text-white shadow-glow">
              <Mail className="h-4 w-4" /> Email it
            </button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-3xl border-2 border-gold/40 bg-gradient-to-br from-gold/20 via-secondary/10 to-primary/15 p-6 md:p-10">
        <div className="flex items-center gap-3">
          <Sunrise className="h-7 w-7 text-gold" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold">Zenith Daily Edition</span>
        </div>
        <h2 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">Good morning, {d?.name ?? "there"} 🌅</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Everything that moved on your job search overnight.</p>
      </div>

      {briefing.isLoading ? (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-muted/40" />
      ) : !d ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="text-lg font-bold">No briefing yet</div>
          <p className="mt-1 text-sm text-muted-foreground">Click "Regenerate" to build your first briefing.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <Section title="💼 New jobs" border="primary">
            {d.newJobs.length === 0 ? <Empty /> : d.newJobs.map((j: any, i: number) => (
              <Row key={i}><span><b>{j.title}</b> at {j.company}</span><span className="font-extrabold text-success">{j.ats_score}%</span></Row>
            ))}
          </Section>
          <Section title="📧 Recruiter replies" border="cyan">
            {d.replies.length === 0 ? <Empty /> : d.replies.map((r: any, i: number) => (
              <Row key={i}><span><b>{r.company}</b> {r.subject}</span><span className="text-xs text-muted-foreground">{r.type}</span></Row>
            ))}
          </Section>
          <Section title="🔔 Followups" border="gold">
            {d.followups.length === 0 ? <Empty /> : d.followups.map((f: any, i: number) => (
              <Row key={i}><span>{f.company}</span><span className="text-xs text-muted-foreground">{f.followup_date}</span></Row>
            ))}
          </Section>
          <Section title="📅 Upcoming interviews" border="cyan">
            {d.interviews.length === 0 ? <Empty /> : d.interviews.map((iv: any, i: number) => (
              <Row key={i}><span>{iv.title}</span><span className="text-xs text-muted-foreground">{new Date(iv.starts_at).toLocaleString()}</span></Row>
            ))}
          </Section>
          <Section title="📈 Your stats" border="success">
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[{ l: "Applied", v: d.stats.applied }, { l: "Response", v: `${d.stats.responseRate}%` }, { l: "Avg ATS", v: `${d.stats.avgAts}%` }].map((x) => (
                <div key={x.l} className="rounded-lg bg-background p-3 text-center">
                  <div className="text-xs text-muted-foreground">{x.l}</div>
                  <div className="text-xl font-extrabold">{x.v}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </AppShell>
  );
}

function Section({ title, border, children }: any) {
  const map: Record<string, string> = { primary: "border-primary/40", cyan: "border-cyan/40", gold: "border-gold/40", success: "border-success/40" };
  return <div className={`rounded-2xl border-2 bg-card p-5 ${map[border]}`}><h3 className="text-lg font-extrabold">{title}</h3><div className="mt-2">{children}</div></div>;
}
function Row({ children }: any) { return <div className="flex items-center justify-between gap-2 border-t border-border py-2 text-sm">{children}</div>; }
function Empty() { return <div className="py-4 text-center text-xs text-muted-foreground">Nothing here</div>; }
