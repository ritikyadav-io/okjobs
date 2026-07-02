import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/zenith/PublicLayout";
import { ArrowRight, Sparkles, Inbox, FileText, Briefcase, Calendar, ShieldCheck, Sunrise } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OkJobs — A quiet career operating system" },
      { name: "description", content: "Discover roles, tailor resumes, and track every conversation on one calm page." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <PublicLayout>
      {/* HERO — tight top spacing, Linear-style */}
      <section className="relative overflow-hidden hero-sunset">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-10 pb-16 md:grid-cols-[1.15fr_1fr] md:pt-16 md:pb-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--beige-deep))] bg-white/60 px-3 py-1 text-xs font-medium text-ink backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(var(--primary))" }} /> Your quiet career OS
            </div>
            <h1 className="mt-6 font-display text-[40px] leading-[1.05] tracking-tight text-ink sm:text-[56px] md:text-[72px]">
              Land the role.<br />Quietly.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-700 md:text-lg">
              Discover matching jobs, tailor your résumé, and track every recruiter reply — on one page.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white"
                style={{ backgroundColor: "hsl(var(--ink))" }}
              >
                Open the app <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-md border border-[hsl(var(--input))] bg-white px-5 py-3 text-sm font-medium text-ink hover:bg-cream"
              >
                About
              </Link>
            </div>
          </div>

          {/* Preview card */}
          <div className="relative">
            <div className="rounded-editorial border border-[hsl(var(--beige-deep))] bg-white p-5 shadow-editorial md:p-6">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">This morning</div>
                <Sunrise className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div className="mt-3 font-display text-xl leading-tight md:text-2xl">
                3 new roles matched. 2 recruiters waiting.
              </div>
              <div className="mt-5 space-y-2.5">
                {[
                  { t: "Senior Product Designer · Linear", s: "ATS 92 · San Francisco" },
                  { t: "Frontend Engineer · Vercel", s: "ATS 88 · Remote" },
                  { t: "Data Analyst · Stripe", s: "ATS 84 · Dublin" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center justify-between rounded-md border border-[hsl(var(--border))] bg-cream-soft px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{r.t}</div>
                      <div className="truncate text-xs text-slate-600">{r.s}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Everything on one page</div>
          <h2 className="mt-2 font-display text-3xl leading-tight md:text-5xl">
            Real work happening underneath.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="hover-lift rounded-editorial border border-[hsl(var(--beige-deep))] bg-cream p-5 md:p-6">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-white">
                <f.icon className="h-5 w-5" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div className="mt-4 font-display text-xl leading-tight md:text-2xl">{f.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-editorial bg-cream p-10 text-center md:p-16">
          <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight text-ink md:text-5xl">
            The next chapter is yours.
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: "hsl(var(--ink))" }}
            >
              Open OkJobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

const FEATURES = [
  { icon: Briefcase, title: "Discover", body: "Live matches from the boards you care about — surfaced on your schedule." },
  { icon: FileText, title: "Tailor", body: "One click rewrites your résumé for each posting with an ATS score." },
  { icon: Inbox, title: "Career Inbox", body: "Recruiter emails categorized, summarized, and ready to reply." },
  { icon: Calendar, title: "Interviews", body: "Follow-ups and interview blocks drafted onto your calendar." },
  { icon: Sunrise, title: "Daily briefing", body: "One quiet email at 8am: new roles, replies, and prep." },
  { icon: ShieldCheck, title: "Yours alone", body: "Single-user by design. Your data stays with you." },
];
