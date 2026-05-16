import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, Briefcase, FileText, Inbox, Bell, Calendar, Sunrise, ArrowRight, Sparkles, Check } from "lucide-react";
import { Logo } from "@/components/zenith/Logo";
import { ThemeToggle } from "@/components/zenith/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZENITH — Reach Your Zenith" },
      { name: "description", content: "AI Operating System for job applications. Auto-discovery, ATS optimization, recruiter monitoring, and smart follow-ups in one bold platform." },
      { property: "og:title", content: "ZENITH — AI Career Operating System" },
      { property: "og:description", content: "Reach Your Zenith. AI-powered job discovery, ATS optimization, recruiter monitoring." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Zap, color: "text-primary", bg: "bg-primary/15", title: "Auto Job Discovery", desc: "Firecrawl scrapes LinkedIn, YC, AngelList, Internshala every 6 hours. AI ranks them by your fit." },
  { icon: FileText, color: "text-secondary", bg: "bg-secondary/15", title: "ATS Resume Optimizer", desc: "Per-job rewrites with keyword diff, score prediction, and Google Docs export." },
  { icon: Inbox, color: "text-cyan", bg: "bg-cyan/15", title: "Recruiter Monitoring", desc: "Gmail scanning every 15 min. Auto-detect interviews, rejections, and offers." },
  { icon: Bell, color: "text-gold", bg: "bg-gold/15", title: "Smart Followups", desc: "Personalized follow-up generated at day 5. Sent via Gmail + Resend automatically." },
  { icon: Calendar, color: "text-success", bg: "bg-success/15", title: "Interview Calendar", desc: "Auto-create Google Calendar events with prep checklists and countdowns." },
  { icon: Sunrise, color: "text-warning", bg: "bg-warning/15", title: "Daily AI Briefing", desc: "8AM newspaper: new matches, ATS tips, recruiter replies, interviews, your stats." },
];

const STEPS = [
  { n: 1, title: "Upload Resume", desc: "We extract skills, projects, tools and set your ATS baseline." },
  { n: 2, title: "AI Finds Jobs", desc: "Ranked by ATS match, competition, and growth potential." },
  { n: 3, title: "Optimize & Apply", desc: "Per-job resume + cover letter. You always review before submitting." },
  { n: 4, title: "Track & Get Hired", desc: "Recruiter inbox, follow-ups, interviews, offers — all auto-tracked." },
];

const PLANS = [
  { name: "Free", price: "₹0", tag: "Start exploring", featured: false, features: ["10 jobs tracked", "Basic ATS scoring", "3 resume optimizations", "Manual apply", "Basic dashboard"] },
  { name: "Pro", price: "₹499", tag: "Most popular", featured: true, features: ["Unlimited jobs", "Gmail monitoring", "Auto followup engine", "Daily briefing email", "Unlimited resume optimize", "Cover letter generator", "Google Docs export"] },
  { name: "Premium", price: "₹999", tag: "For power users", featured: false, features: ["Everything in Pro", "Google Sheets export", "Resume version history", "Advanced analytics", "Interview prep checklist", "Salary insights", "Priority support"] },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="hidden rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-accent sm:inline-block">Log in</Link>
            <Link to="/signup" className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">Start Free</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 animated-grid opacity-40" />
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -right-32 top-40 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 text-center md:pt-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            AI Career Operating System
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Reach Your <span className="text-gradient-brand">Zenith</span> 🚀
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Auto-discover the best jobs, rewrite your resume per role, monitor recruiter emails, and never miss a follow-up. The operating system every job seeker deserves.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-6 py-3 text-base font-semibold text-white shadow-glow">
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how" className="rounded-lg border-2 border-border px-6 py-3 text-base font-semibold hover:bg-accent">
              See How It Works
            </a>
          </div>

          <div className="mx-auto mt-16 max-w-3xl rounded-2xl border-2 border-border bg-card p-6 text-sm text-muted-foreground shadow-glow">
            Your live dashboard fills with real applications, recruiter emails, interviews, and follow-ups after you sign in.
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Everything you need to land it</h2>
          <p className="mt-3 text-muted-foreground">Six bold systems working in the background, all day.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border-2 border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow">
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${f.bg}`}>
                <f.icon className={`h-6 w-6 ${f.color}`} strokeWidth={2.5} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">How it works</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl border-2 border-border bg-background p-6">
                <div className="absolute -top-4 left-6 grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-sm font-extrabold text-white shadow-glow">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Simple, bold pricing</h2>
          <p className="mt-3 text-muted-foreground">Free to start. Upgrade when you're winning.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border-2 p-6 transition-all ${
                p.featured
                  ? "border-primary bg-gradient-to-b from-primary/10 to-card shadow-glow md:-translate-y-2"
                  : "border-border bg-card"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-bold text-white">
                  Most Popular
                </div>
              )}
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{p.tag}</div>
              <div className="mt-1 text-2xl font-extrabold">{p.name}</div>
              <div className="mt-2 text-4xl font-extrabold">
                {p.price}<span className="text-base font-medium text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold ${
                  p.featured
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "border border-border hover:bg-accent"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          Your next role is one <span className="text-gradient-brand">Zenith</span> away
        </h2>
        <Link to="/signup" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-7 py-3.5 text-base font-semibold text-white shadow-glow">
          Start Free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="hidden sm:inline">· Reach Your Zenith</span>
          </div>
          <div>© {new Date().getFullYear()} Zenith</div>
        </div>
      </footer>
    </div>
  );
}

// silence unused warning
void Briefcase;
