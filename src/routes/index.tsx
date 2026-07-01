import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/zenith/PublicLayout";
import { ArrowRight, Sparkles, Inbox, FileText, Briefcase, Calendar, ShieldCheck, Sunrise } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OkJobs — A quiet career operating system" },
      { name: "description", content: "Discover roles, tailor resumes, and track every conversation. An editorial career OS with AI on the inside." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <PublicLayout>
      {/* HERO — Mistral "sunset" band */}
      <section className="relative overflow-hidden hero-sunset">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1.15fr_1fr] md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--beige-deep))] bg-white/60 px-3 py-1 text-xs font-medium text-ink backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(var(--primary))" }} /> Frontier career OS. In your hands.
            </div>
            <h1 className="mt-8 font-display text-[52px] leading-[1.05] tracking-tight text-ink md:text-[84px]">
              Land the role.<br/>Quietly, deliberately.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-700">
              OkJobs is a single-user career operating system. It reads your inbox, watches the job boards,
              tailors your résumé, and keeps every interview on one calm page.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
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
                Read the story
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 text-ink">
              {[
                { n: "75%", l: "less busywork" },
                { n: "80%", l: "faster tailoring" },
                { n: "100%", l: "yours only" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-4xl md:text-5xl" style={{ letterSpacing: "-0.02em" }}>{s.n}</div>
                  <div className="mt-1 text-xs text-slate-600">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Product preview card */}
          <div className="relative">
            <div className="rounded-editorial border border-[hsl(var(--beige-deep))] bg-white p-6 shadow-editorial">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">This morning</div>
                <Sunrise className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div className="mt-3 font-display text-2xl leading-tight">
                3 new roles matched your criteria. 2 recruiters are waiting on you.
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { t: "Senior Product Designer · Linear", s: "ATS 92 · San Francisco" },
                  { t: "Frontend Engineer · Vercel", s: "ATS 88 · Remote" },
                  { t: "Data Analyst · Stripe", s: "ATS 84 · Dublin" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center justify-between rounded-md border border-[hsl(var(--border))] bg-cream-soft px-3 py-2.5">
                    <div>
                      <div className="text-sm font-medium">{r.t}</div>
                      <div className="text-xs text-slate-600">{r.s}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-editorial border border-[hsl(var(--beige-deep))] bg-cream p-4 shadow-card md:block">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">Career Inbox</div>
              <div className="mt-1 font-display text-lg">Interview · Thursday 3pm</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Everything on one page</div>
          <h2 className="mt-2 font-display text-4xl leading-tight md:text-5xl">
            A calm surface with real work happening underneath.
          </h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="hover-lift rounded-editorial border border-[hsl(var(--beige-deep))] bg-cream p-6">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-white">
                <f.icon className="h-5 w-5" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div className="mt-5 font-display text-2xl leading-tight">{f.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA on cream */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-editorial bg-cream p-12 text-center md:p-20">
          <h2 className="mx-auto max-w-2xl font-display text-4xl leading-tight text-ink md:text-6xl">
            The next chapter of your career is yours.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-700">
            Open OkJobs and start where you left off. No sign-up, no ceremony.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
  { icon: Briefcase, title: "Discover", body: "OkJobs scans the boards on your schedule and only surfaces roles that fit the criteria you set." },
  { icon: FileText, title: "Tailor", body: "One click rewrites your résumé for each posting and shows an ATS score before you apply." },
  { icon: Inbox, title: "Career Inbox", body: "Recruiter emails are categorized, summarized, and waiting for a reply — never buried." },
  { icon: Calendar, title: "Interviews", body: "Follow-ups and interview blocks are drafted onto your calendar automatically." },
  { icon: Sunrise, title: "Daily briefing", body: "One quiet email at 8am with your day: new roles, replies to send, prep to do." },
  { icon: ShieldCheck, title: "Yours alone", body: "Single-user by design. Your data lives with you and never becomes a product." },
];
