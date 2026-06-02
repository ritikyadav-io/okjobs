import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Zap, Briefcase, FileText, Inbox, Bell, Calendar, Sunrise, ArrowRight,
  Sparkles, Check, ChevronDown, Search, Mail, Download, ClipboardList,
  PenLine, Send, Target, BarChart3, Star, X, Play,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/zenith/Logo";
import { ThemeToggle } from "@/components/zenith/ThemeToggle";
import { SiteFooter } from "@/components/zenith/SiteFooter";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OkJobs — Your AI Career Operating System" },
      { name: "description", content: "Discover jobs, generate ATS-optimized resumes, track recruiters, automate follow-ups, and manage your career from one place. Join 50,000+ job seekers on OkJobs." },
      { property: "og:title", content: "OkJobs — Your AI Career Operating System" },
      { property: "og:description", content: "AI-powered job search, resume builder, recruiter tracking, and application management." },
      { name: "keywords", content: "AI job search, ATS resume builder, recruiter tracker, career management, job application tracker, resume optimizer" },
    ],
  }),
  component: Landing,
});

const STATS = [
  { label: "Jobs Indexed", value: "50,000+" },
  { label: "Resumes Generated", value: "12,000+" },
  { label: "Interviews Scheduled", value: "4,500+" },
  { label: "Offers Received", value: "1,200+" },
];

const COMPANIES = ["Google","Amazon","Microsoft","Uber","Atlassian","Databricks","Adobe","Stripe","Nvidia","Netflix","Spotify","Salesforce"];
const PLACEMENTS = [...COMPANIES, "TCS","Infosys","Accenture","Cognizant","Wipro"];

const FEATURES = [
  { icon: Search, title: "AI Job Discovery", desc: "Auto-scan 50+ job boards every few hours." },
  { icon: Target, title: "ATS Resume Optimization", desc: "Per-role keyword rewrites with score prediction." },
  { icon: Mail, title: "Recruiter Email Tracking", desc: "Gmail scanning detects interviews and offers." },
  { icon: Calendar, title: "Interview Calendar", desc: "Auto-create events with prep checklists." },
  { icon: Bell, title: "Follow-Up Automation", desc: "Personalized day-5 follow-ups sent for you." },
  { icon: Download, title: "Google Docs Export", desc: "One-click export to Docs, PDF, or DOCX." },
  { icon: Sunrise, title: "Daily Briefings", desc: "Morning newspaper with matches and replies." },
  { icon: ClipboardList, title: "Application Tracker", desc: "Kanban board for every stage of every role." },
  { icon: FileText, title: "Resume Generator", desc: "Tailored resume for every single application." },
  { icon: PenLine, title: "Cover Letter Generator", desc: "Warm, specific letters in seconds." },
];

const STEPS = [
  { n: 1, title: "Connect Gmail", desc: "One click. Secure OAuth." },
  { n: 2, title: "Discover Jobs", desc: "AI surfaces the best matches." },
  { n: 3, title: "Generate Resume", desc: "ATS-optimized for every role." },
  { n: 4, title: "Apply Faster", desc: "One-click submit with tracking." },
  { n: 5, title: "Track Recruiters", desc: "Never miss a reply or interview." },
  { n: 6, title: "Land Interviews", desc: "Calendar + prep done for you." },
];

const TESTIMONIALS = [
  { name: "Aarav S.", role: "Frontend Eng • Razorpay", quote: "Got 3 interviews in 2 weeks using OkJobs." },
  { name: "Priya M.", role: "Data Analyst • Swiggy", quote: "ATS score jumped from 41 to 92 after optimization." },
  { name: "Rohan K.", role: "Backend Eng • CRED", quote: "Recruiters started replying after I enabled follow-up automation." },
  { name: "Ishita V.", role: "ML Engineer • Databricks", quote: "Landed a ₹18 LPA offer at Databricks in 6 weeks." },
  { name: "Karthik R.", role: "PM • Zomato", quote: "Never tracked applications before — now I close loops on every one." },
  { name: "Neha B.", role: "Designer • Atlassian", quote: "The daily briefing is genuinely the first email I open." },
  { name: "Aman T.", role: "DevOps • Microsoft", quote: "Resume Lab cut my prep time from hours to minutes." },
  { name: "Sneha P.", role: "Recruiter Lead", quote: "Candidates from OkJobs are noticeably better prepared." },
  { name: "Vikram J.", role: "iOS Eng • Uber", quote: "Three offers in one month. The follow-up engine is unreal." },
  { name: "Tanvi G.", role: "New Grad • Adobe", quote: "First job out of college, thanks to OkJobs' job discovery." },
];

const PLANS = [
  { name: "Free", price: "₹0", tag: "Start exploring", featured: false, features: ["10 jobs/day discovery","3 resume generations","3 cover letters","ATS score analysis"] },
  { name: "Pro", price: "₹499", tag: "Most popular", featured: true, features: ["Unlimited jobs","20 resumes/month","20 cover letters/month","Recruiter tracking","Follow-up automation","Google Docs export","Daily briefings"] },
  { name: "Premium", price: "₹999", tag: "For power users", featured: false, features: ["Everything in Pro","Unlimited resumes","Unlimited cover letters","Priority support","Advanced analytics","Resume version history"] },
];

const FAQS = [
  { q: "Is OkJobs free to use?", a: "Yes. The Free plan gives you 10 daily job discoveries, 3 resumes, and ATS analysis — no credit card required." },
  { q: "How does ATS optimization work?", a: "We parse the job description, extract required keywords, and rewrite your resume to maximize ATS match while keeping every fact truthful." },
  { q: "Does OkJobs connect to my Gmail?", a: "Yes, via secure Google OAuth. We only read recruiter-related messages to detect interviews, offers, and follow-up opportunities." },
  { q: "Can I export my resume as PDF or DOCX?", a: "Yes — one-click export to Google Docs, PDF, and DOCX from the Resume Lab." },
  { q: "How does recruiter tracking work?", a: "We classify every recruiter email (interview, offer, rejection, follow-up) and surface the next best action in your inbox." },
  { q: "Is my data secure?", a: "All data is encrypted in transit and at rest. Tokens are stored securely and you can disconnect any integration anytime." },
  { q: "What job boards does OkJobs scrape?", a: "LinkedIn, Naukri, Indeed, YC, AngelList, Internshala, and 40+ more — refreshed multiple times daily." },
  { q: "How does the follow-up automation work?", a: "Five days after you apply, we draft a personalized follow-up referencing the role and send it via your connected Gmail." },
  { q: "Can I use OkJobs for international jobs?", a: "Absolutely. Discovery and ATS optimization work for any role, any country, any language the JD is written in." },
  { q: "How is OkJobs different from LinkedIn or Indeed?", a: "OkJobs is an end-to-end career OS — discovery, resume, recruiter tracking, interviews, and follow-ups in one place, not a job board." },
];

const TABS = [
  { key: "jobs", label: "Jobs Dashboard", caption: "AI-ranked matches refreshed continuously." },
  { key: "resume", label: "Resume Lab", caption: "ATS score, keyword diff, one-click rewrite." },
  { key: "inbox", label: "Recruiter Inbox", caption: "Every email classified with next-action." },
  { key: "calendar", label: "Interview Calendar", caption: "Auto-scheduled events with prep checklists." },
  { key: "apps", label: "Application Tracker", caption: "Kanban for every stage of every role." },
  { key: "briefing", label: "Daily Briefing", caption: "Your morning newspaper for the job hunt." },
];

function Landing() {
  const [tab, setTab] = useState(TABS[0].key);
  const [open, setOpen] = useState<number | null>(0);
  const [demoOpen, setDemoOpen] = useState(false);
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard", replace: true });
  }, [user, loading, nav]);
  const ctaHref = user ? "/dashboard" : "/signup";

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="hidden rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-accent sm:inline-block">Log in</Link>
            <Link to={ctaHref} className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.97]">
              {user ? "Open app" : "Start Free"}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 animated-grid opacity-30" />
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -right-32 top-40 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 md:grid-cols-2 md:pt-24">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Your AI Career Operating System
            </div>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Reach Your <span className="text-gradient-brand">Dream Job</span> Faster
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground md:mx-0">
              Discover jobs, generate ATS-optimized resumes, track recruiters, automate follow-ups, and manage your entire career — from one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-base font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.97]">
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="rounded-full border-2 border-border px-6 py-3 text-base font-semibold transition-all hover:border-primary/40 hover:bg-accent">
                Watch Demo ▶
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-brand opacity-30 blur-3xl" />
            <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-glow backdrop-blur">
              <div className="flex items-center gap-1.5 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
              </div>
              <div className="rounded-xl bg-background/60 p-4">
                <div className="text-xs font-semibold text-muted-foreground">Today's matches</div>
                <div className="mt-2 grid gap-2">
                  {["Frontend Engineer • Razorpay","Product Designer • Atlassian","ML Engineer • Databricks"].map((r,i) => (
                    <div key={r} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
                      <span className="truncate">{r}</span>
                      <span className="ml-2 shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                        {92 - i*4}% match
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[78%] rounded-full bg-gradient-brand" />
                  </div>
                  <span className="text-xs font-bold text-primary">ATS 78</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-12 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold tracking-tight md:text-4xl">{s.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LOGO MARQUEE */}
      <section className="overflow-hidden py-12">
        <div className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Top companies hiring on OkJobs
        </div>
        <div className="mt-6 flex gap-12 [animation:marquee_40s_linear_infinite] whitespace-nowrap">
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <span key={i} className="text-2xl font-bold text-muted-foreground/70 transition-colors hover:text-foreground">
              {c}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </section>

      {/* PRODUCT TABS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">See it in action</h2>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                tab === t.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6 shadow-glow backdrop-blur">
          <div className="grid aspect-[16/8] place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-sm text-muted-foreground">
            {TABS.find(t => t.key === tab)?.label} preview
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {TABS.find(t => t.key === tab)?.caption}
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Everything you need to land your next role</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15">
                <f.icon className="h-5 w-5 text-primary" strokeWidth={2.4} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Get hired in 6 steps</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-background p-6">
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

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Real results from real job seekers</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="relative rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition-all hover:border-primary/40">
              <div className="absolute left-0 top-6 h-12 w-1 rounded-r bg-gradient-brand" />
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-warm text-sm font-extrabold text-white">
                  {t.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold">{t.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5">
                {Array.from({length:5}).map((_,i) => <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />)}
              </div>
              <p className="mt-3 text-sm text-foreground/90">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLACEMENT WALL */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Our users landed roles at</h2>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {PLACEMENTS.map((c) => (
              <div key={c} className="grid h-16 place-items-center rounded-xl border border-border bg-background text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-muted-foreground">Free to start. Upgrade when you're winning.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border-2 p-6 transition-all ${
                p.featured ? "border-primary bg-gradient-to-b from-primary/10 to-card shadow-glow md:-translate-y-2" : "border-border bg-card"
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
                className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97] ${
                  p.featured ? "bg-gradient-brand text-white shadow-glow" : "border border-border hover:bg-accent"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Frequently asked questions</h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className="overflow-hidden rounded-xl border border-border bg-background">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold transition-colors hover:bg-accent"
                  >
                    {f.q}
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground animate-fade-in">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 animated-grid opacity-20" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-brand opacity-30 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Your next role is one <span className="text-gradient-brand">OkJobs</span> away
          </h2>
          <Link to="/signup" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-base font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.97]">
            Start Free — It's Free Forever <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// silence unused warnings
void Briefcase; void Zap; void Send; void Inbox;
