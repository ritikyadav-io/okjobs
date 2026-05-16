import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { Sunrise, Briefcase, Inbox, Bell, Calendar, TrendingUp, Sparkles } from "lucide-react";

export const Route = createFileRoute("/briefing")({
  head: () => ({ meta: [{ title: "Daily Briefing — Zenith" }, { name: "description", content: "Your AI-curated 8AM newspaper on your job search." }] }),
  component: BriefingPage,
});

function BriefingPage() {
  return (
    <AppShell>
      <PageHeader
        title="Daily Briefing"
        description="Generated at 8:00 AM · also sent via Resend"
        actions={<span className="rounded-full bg-gradient-warm px-3 py-1 text-xs font-bold text-white">Saturday, May 16</span>}
      />

      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border-2 border-gold/40 bg-gradient-to-br from-gold/20 via-secondary/10 to-primary/15 p-6 md:p-10">
        <div className="flex items-center gap-3">
          <Sunrise className="h-7 w-7 text-gold" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold">Zenith Daily Edition</span>
        </div>
        <h2 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">Good morning, Aarav 🌅</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Here's everything that moved on your job search overnight. Read this, act on three things, and you'll be ahead of 99% of candidates today.</p>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { i: Briefcase, l: "New jobs", v: 12, c: "text-primary" },
          { i: Inbox, l: "Replies", v: 3, c: "text-secondary" },
          { i: Bell, l: "Followups", v: 4, c: "text-gold" },
          { i: Calendar, l: "Interviews", v: 2, c: "text-cyan" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border-2 border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">{s.l}</span>
              <s.i className={`h-4 w-4 ${s.c}`} />
            </div>
            <div className="mt-1 text-3xl font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Section title="💼 New jobs today" accent="primary">
          {[
            { c: "Linear", r: "Frontend Engineer", s: 87 },
            { c: "Vercel", r: "Full-Stack Engineer", s: 82 },
            { c: "Stripe", r: "Frontend Engineer", s: 81 },
          ].map((j) => (
            <div key={j.c} className="flex items-center justify-between border-t border-border py-2 text-sm">
              <span><span className="font-semibold">{j.r}</span> at {j.c}</span>
              <span className="font-extrabold text-success">{j.s}%</span>
            </div>
          ))}
        </Section>

        <Section title="⚠️ ATS weak spots" accent="secondary">
          {["Add SQL to skills section", "Mention Agile in projects", "Quantify your Notion impact"].map((t) => (
            <div key={t} className="flex items-start gap-2 border-t border-border py-2 text-sm">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /> {t}
            </div>
          ))}
        </Section>

        <Section title="📧 Recruiter replies" accent="cyan">
          {[
            { c: "Linear", m: "sent interview invite!" },
            { c: "Stripe", m: "OA assessment delivered" },
            { c: "Zoho", m: "viewed your profile" },
          ].map((r) => (
            <div key={r.c} className="border-t border-border py-2 text-sm"><span className="font-semibold">{r.c}</span> {r.m}</div>
          ))}
        </Section>

        <Section title="🔔 Followups needed" accent="gold">
          {["Vercel — 5 days no reply", "Razorpay — 6 days no reply"].map((t) => (
            <div key={t} className="border-t border-border py-2 text-sm">{t}</div>
          ))}
        </Section>

        <Section title="📅 Interviews this week" accent="cyan">
          {["Linear — Tomorrow 3PM", "Stripe — Friday 11:30AM"].map((t) => (
            <div key={t} className="border-t border-border py-2 text-sm">{t}</div>
          ))}
        </Section>

        <Section title="📈 Your stats" accent="success">
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[{ l: "Applied", v: "29" }, { l: "Response", v: "31%" }, { l: "Avg ATS", v: "78%" }].map((x) => (
              <div key={x.l} className="rounded-lg bg-background p-3 text-center">
                <div className="text-xs text-muted-foreground">{x.l}</div>
                <div className="text-xl font-extrabold">{x.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success">
            <TrendingUp className="h-3 w-3" /> +6% response vs last week
          </div>
        </Section>
      </div>

      <div className="mt-8 rounded-2xl border-2 border-primary/40 bg-gradient-brand p-6 text-center text-white shadow-glow">
        <div className="text-lg font-bold">Keep going. You're doing great. 💪</div>
        <div className="mt-1 text-sm text-white/85">Apply to 1 job today to keep your 7-day streak alive.</div>
      </div>
    </AppShell>
  );
}

function Section({ title, accent, children }: { title: string; accent: "primary" | "secondary" | "cyan" | "gold" | "success"; children: React.ReactNode }) {
  const map: Record<string, string> = {
    primary: "border-primary/40",
    secondary: "border-secondary/40",
    cyan: "border-cyan/40",
    gold: "border-gold/40",
    success: "border-success/40",
  };
  return (
    <div className={`rounded-2xl border-2 bg-card p-5 ${map[accent]}`}>
      <h3 className="text-lg font-extrabold">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}
