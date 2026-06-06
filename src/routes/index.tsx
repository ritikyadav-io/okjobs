import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Zap, Briefcase, FileText, Inbox, Bell, Calendar, Sunrise, ArrowRight,
  Sparkles, Check, ChevronDown, Search, Mail, Download, ClipboardList,
  PenLine, Target, BarChart3, Star, X, Play, Shield, Lock, Eye,
  TrendingUp, Users, Award, BookOpen, Github, Linkedin, Youtube, Twitter,
  CheckCircle2, XCircle, Rocket, Brain, MessageSquare, DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/zenith/Logo";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OkJobs — Land More Interviews with AI" },
      { name: "description", content: "OkJobs is the AI Career OS. Discover jobs, generate ATS resumes, track recruiters, automate follow-ups, and land more interviews — all from one premium dashboard." },
      { property: "og:title", content: "OkJobs — Your AI Career Operating System" },
      { property: "og:description", content: "Stop applying blindly. Land more interviews with AI-powered job discovery, ATS optimization, recruiter tracking and follow-up automation." },
      { name: "keywords", content: "AI job search, ATS resume builder, recruiter tracker, application tracker, interview automation, resume optimizer" },
    ],
  }),
  component: Landing,
});

const STATS = [
  { value: "50,000+", label: "Jobs Indexed", icon: Briefcase },
  { value: "12,000+", label: "Resumes Generated", icon: FileText },
  { value: "4,500+", label: "Interviews Scheduled", icon: Calendar },
  { value: "1,200+", label: "Offers Received", icon: Award },
];

const COMPANIES = ["Google","Amazon","Microsoft","Adobe","Uber","Databricks","Stripe","Salesforce","Atlassian","Nvidia","TCS","Infosys","Accenture","Wipro","Cognizant"];

const PROBLEMS = [
  { icon: Search, title: "Manual searching", desc: "Hours lost scrolling job boards every day." },
  { icon: XCircle, title: "ATS rejection", desc: "75% of resumes never reach a human." },
  { icon: Mail, title: "Missed recruiter emails", desc: "Replies buried under newsletters and spam." },
  { icon: Bell, title: "Forgotten follow-ups", desc: "Warm leads going cold after day three." },
  { icon: ClipboardList, title: "Scattered tools", desc: "Sheets, docs, tabs — nothing connected." },
  { icon: Brain, title: "Decision fatigue", desc: "No insight into what's actually working." },
];

const SOLUTIONS = [
  "AI scans 50+ boards every few hours and surfaces only matches above your fit threshold.",
  "Every resume is auto-rewritten per role with ATS keyword targeting and a live score.",
  "Gmail integration parses recruiter emails and surfaces them in a dedicated inbox.",
  "Automated, personalized follow-ups go out on day 5 — written in your voice.",
  "One dashboard for jobs, resumes, recruiters, interviews and offers.",
  "Weekly briefings tell you what's converting and what to change next.",
];

const STEPS = [
  { n: 1, title: "Create Profile", desc: "Tell OkJobs about your target role, salary, and skills.", icon: Users },
  { n: 2, title: "Upload Resume", desc: "We parse it, score it, and build your career graph.", icon: FileText },
  { n: 3, title: "Discover Jobs", desc: "AI surfaces high-fit roles from 50+ sources daily.", icon: Search },
  { n: 4, title: "Generate ATS Resume", desc: "One-click tailored resume per job, 90+ ATS score.", icon: Target },
  { n: 5, title: "Apply", desc: "Export to Google Docs, PDF or DOCX and submit.", icon: Rocket },
  { n: 6, title: "Track Recruiters", desc: "Gmail auto-classifies replies into one inbox.", icon: Inbox },
  { n: 7, title: "Schedule Interviews", desc: "Auto-create events with prep checklists.", icon: Calendar },
  { n: 8, title: "Land Offers", desc: "Compare, negotiate, and track every offer.", icon: Award },
];

const SHOWCASE = [
  { title: "Command Dashboard", desc: "Pipeline, ATS scores, replies and upcoming follow-ups in a single glance.", tag: "Dashboard" },
  { title: "Job Discovery", desc: "AI-ranked job feed with fit scores, salary signals and one-click apply.", tag: "Jobs" },
  { title: "Resume Lab", desc: "Tailored ATS resume per role with live keyword diff and score prediction.", tag: "Resume Lab" },
  { title: "Career Inbox", desc: "AI-classified inbox that surfaces interview invites, offers and recruiter replies.", tag: "Inbox" },
  { title: "Interview Calendar", desc: "Auto-scheduled prep blocks, reminders and post-interview notes.", tag: "Calendar" },
  { title: "Application Tracker", desc: "Kanban view across applied, screen, onsite, offer and rejected.", tag: "Tracker" },
];

const FEATURES = [
  { icon: Search, title: "AI Job Discovery", desc: "Auto-scan 50+ job boards every few hours." },
  { icon: Target, title: "ATS Resume Builder", desc: "Per-role keyword rewrites with live score." },
  { icon: Sparkles, title: "Resume Optimization", desc: "Diffed suggestions you can accept in one click." },
  { icon: Inbox, title: "Career Inbox", desc: "AI classifies offers, interviews and recruiter replies." },
  { icon: ClipboardList, title: "Application Tracker", desc: "Kanban from applied to offer." },
  { icon: Calendar, title: "Interview Calendar", desc: "Auto-events with prep checklists." },
  { icon: Bell, title: "Follow-Up Automation", desc: "Personalized day-5 nudges sent for you." },
  { icon: BarChart3, title: "Career Insights", desc: "What's converting and what to change." },
  { icon: Download, title: "Google Docs Export", desc: "Docs, PDF and DOCX in one click." },
  { icon: PenLine, title: "Cover Letter Generator", desc: "Warm, role-specific letters in seconds." },
  { icon: Mail, title: "Email Monitoring", desc: "Never miss a recruiter reply again." },
  { icon: DollarSign, title: "Salary Insights", desc: "Live comp data per role and location." },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "SDE II", company: "Amazon", result: "4 interviews in 14 days", quote: "OkJobs rewrote my resume per role and my callbacks tripled within two weeks." },
  { name: "Marcus Lee", role: "Product Manager", company: "Stripe", result: "ATS score 45 → 91", quote: "The ATS lab made the difference. I finally stopped getting auto-rejected." },
  { name: "Ananya Iyer", role: "Data Scientist", company: "Databricks", result: "8 hours saved weekly", quote: "I stopped living in tabs. Everything is in one inbox now." },
  { name: "Daniel Okonkwo", role: "Frontend Engineer", company: "Adobe", result: "Offer in 5 weeks", quote: "The Career Inbox surfaced a reply I would have completely missed." },
  { name: "Sofia Alvarez", role: "Designer", company: "Atlassian", result: "12 quality applies/week", quote: "Quality over quantity. I only apply to roles with 80%+ fit now." },
  { name: "Ravi Krishnan", role: "Backend Engineer", company: "Uber", result: "3 onsites in a month", quote: "Follow-up automation alone is worth it. Two onsites came from day-5 nudges." },
  { name: "Emily Chen", role: "PM Intern", company: "Microsoft", result: "First-week interviews", quote: "As a new grad this felt like having a career coach on standby 24/7." },
  { name: "Joon-ho Park", role: "ML Engineer", company: "Nvidia", result: "ATS 52 → 94", quote: "The keyword diff is genius. I see exactly what's missing per JD." },
  { name: "Aisha Bello", role: "DevOps", company: "Salesforce", result: "Switched roles in 6 weeks", quote: "I moved from a startup to enterprise without burning weekends searching." },
  { name: "Liam O'Connor", role: "iOS Engineer", company: "Spotify", result: "Recruiter callbacks +73%", quote: "It feels like the platform is actually fighting for me." },
];

const RESULTS = [
  { stat: "89%", label: "Higher Interview Rate" },
  { stat: "73%", label: "More Recruiter Replies" },
  { stat: "3.2x", label: "More Qualified Applies" },
  { stat: "8 hrs", label: "Saved Per Week" },
];

const COMPARISON = [
  { row: "Job Discovery", old: "Manual scrolling, 50+ tabs", okj: "AI ranks 50+ boards every few hours" },
  { row: "Resume", old: "Edit a generic doc for hours", okj: "ATS-optimized per role in seconds" },
  { row: "Recruiter Replies", old: "Buried in Gmail noise", okj: "Auto-classified into one inbox" },
  { row: "Follow-Ups", old: "Forgotten by day three", okj: "Automated personalized day-5 nudges" },
  { row: "Tracking", old: "Spreadsheets and sticky notes", okj: "Kanban tracker with timelines" },
  { row: "Insights", old: "No idea what's working", okj: "Weekly briefings with conversion data" },
];

const SECURITY = [
  { icon: Lock, title: "End-to-End Encryption", desc: "All resume and email data is encrypted at rest and in transit." },
  { icon: Shield, title: "Google OAuth Security", desc: "Gmail access is scoped, revocable and audited per session." },
  { icon: Eye, title: "Private by Default", desc: "Your data is never sold and never used to train external models." },
  { icon: FileText, title: "Resume Security", desc: "Resume versions are versioned and deletable any time." },
  { icon: Users, title: "Account Protection", desc: "MFA, session monitoring and instant device sign-out." },
];

const RESOURCES = [
  { icon: BookOpen, title: "ATS Guides", desc: "How real ATS systems parse and rank resumes." },
  { icon: FileText, title: "Resume Templates", desc: "Battle-tested templates for every role." },
  { icon: MessageSquare, title: "Interview Guides", desc: "Behavioral and technical prep playbooks." },
  { icon: DollarSign, title: "Salary Negotiation", desc: "Scripts and tactics for higher offers." },
  { icon: TrendingUp, title: "Career Growth", desc: "Frameworks for getting promoted faster." },
  { icon: PenLine, title: "OkJobs Blog", desc: "Weekly essays on the modern job hunt." },
];

const FAQS = [
  { q: "How does OkJobs find jobs?", a: "We scan 50+ job boards (LinkedIn, Indeed, company career pages, Greenhouse, Lever, Ashby and more) every few hours and rank them against your profile using AI fit scoring." },
  { q: "Will my resume actually pass ATS?", a: "Yes. Every generated resume targets the exact JD with keyword density, formatting and section ordering tuned for systems like Workday, Greenhouse, Lever and Taleo. Live ATS score predicts pass-rate before you submit." },
  { q: "Is my Gmail data safe?", a: "We use Google OAuth with read-only scopes. Emails are processed in memory and only recruiter-classified metadata is stored. You can revoke access at any time from Settings." },
  { q: "Do I need to write cover letters?", a: "No. OkJobs generates a warm, role-specific cover letter for every application — editable before you send." },
  { q: "Can I export to Google Docs?", a: "Yes. One-click export to Google Docs, PDF and DOCX with formatting preserved." },
  { q: "How much does it cost?", a: "OkJobs offers a generous free plan. Pro unlocks unlimited AI generations, Gmail tracking and follow-up automation." },
  { q: "Will OkJobs apply for me?", a: "OkJobs generates a tailored resume and cover letter for each role. You hit submit — we never apply on your behalf without consent." },
  { q: "How do follow-ups work?", a: "Five days after you apply (and no recruiter reply has been detected), OkJobs drafts a personalized follow-up in your voice. You approve and we send." },
  { q: "Does this work for non-tech roles?", a: "Yes. OkJobs supports product, design, data, marketing, finance, operations, sales and engineering across regions." },
  { q: "What countries are supported?", a: "OkJobs works globally with strongest coverage in US, EU, UK, Canada, India, Australia and Singapore." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel from Settings in one click. No retention emails, no friction." },
  { q: "Will I see what changed in my resume?", a: "Every rewrite shows a side-by-side diff with accepted keywords and ATS score delta." },
  { q: "Does OkJobs track interview prep?", a: "Yes. Each scheduled interview gets a prep checklist with role-specific questions and company research." },
  { q: "Is there a mobile app?", a: "OkJobs is a fully responsive PWA — install it on iOS and Android from your browser." },
  { q: "How do I get support?", a: "Email founders@okjobs.app or use in-app chat. We reply within hours, every day." },
];

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How It Works" },
  { href: "#testimonials", label: "Success Stories" },
  { href: "#pricing", label: "Pricing" },
  { href: "#resources", label: "Resources" },
  { href: "#faq", label: "FAQ" },
];

function Landing() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [loading, user, nav]);

  const ctaHref = user ? "/dashboard" : "/signup";
  const ctaLabel = user ? "Open app" : "Get Started Free";

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">{l.label}</a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent">Log in</Link>
            <Link to={ctaHref} className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-[0.97]">
              {ctaLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <button aria-label="Menu" onClick={() => setMobileNav(v => !v)} className="grid h-10 w-10 place-items-center rounded-lg border border-border md:hidden">
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileNav ? "rotate-180" : ""}`} />
          </button>
        </div>
        {mobileNav && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMobileNav(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">{l.label}</a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" className="rounded-lg border border-border px-3 py-2 text-center text-sm font-semibold">Log in</Link>
                <Link to={ctaHref} className="rounded-lg bg-gradient-brand px-3 py-2 text-center text-sm font-semibold text-white">{ctaLabel}</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
          <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-cyan/20 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-8 pb-16 md:px-6 md:pt-12 md:pb-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Career Operating System
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Stop Applying Blindly.<br />
              <span className="bg-gradient-brand bg-clip-text text-transparent">Start Landing More Interviews.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              OkJobs discovers jobs, optimizes your resume for ATS systems, tracks recruiter emails, manages applications and keeps you ahead of every opportunity — all in one premium dashboard.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to={ctaHref} className="group inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3.5 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-[0.97]">
                {ctaLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button onClick={() => setDemoOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold hover:bg-accent">
                <Play className="h-4 w-4" /> Watch Demo
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="flex">{[...Array(5)].map((_,i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</div><span className="font-semibold text-foreground">4.9/5</span></div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> 50,000+ jobs indexed</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> 12,000+ resumes optimized</div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-card/40 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-6 text-center">
                <s.icon className="mx-auto h-6 w-6 text-primary" />
                <div className="mt-3 bg-gradient-brand bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPANY LOGO WALL */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted by job seekers targeting the world's best companies
          </p>
          <div className="relative mt-8 overflow-hidden">
            <div className="flex animate-[scroll_40s_linear_infinite] gap-10 whitespace-nowrap">
              {[...COMPANIES, ...COMPANIES].map((c, i) => (
                <div key={i} className="text-2xl font-bold tracking-tight text-muted-foreground/70 md:text-3xl">{c}</div>
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </section>

      {/* PROBLEM + SOLUTION */}
      <section className="border-y border-border bg-card/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-destructive">The Problem</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Job Searching Is Broken</h2>
            <p className="mt-4 text-muted-foreground">You're not lazy. The system is just brutally inefficient. Here's what every modern job seeker faces — and how OkJobs fixes it.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PROBLEMS.map((p, i) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive"><p.icon className="h-5 w-5" /></div>
                  <div>
                    <div className="font-bold">{p.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{p.desc}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div className="text-sm text-foreground/90">{SOLUTIONS[i]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">How It Works</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">From Profile to Offer in 8 Steps</h2>
            <p className="mt-4 text-muted-foreground">A guided workflow built around how recruiters actually hire — not how job boards want you to scroll.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(s => (
              <div key={s.n} className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-sm font-extrabold text-white">{s.n}</div>
                  <s.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <div className="mt-4 font-bold">{s.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="border-y border-border bg-card/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Product Tour</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Your Entire Career In One Place</h2>
            <p className="mt-4 text-muted-foreground">Every screen is built for clarity, speed, and zero context-switching.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {SHOWCASE.map((s, i) => (
              <div key={s.tag} className="overflow-hidden rounded-2xl border border-border bg-card">
                <FakeScreenshot label={s.tag} variant={i % 4} />
                <div className="p-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-primary">{s.tag}</div>
                  <div className="mt-2 text-xl font-bold">{s.title}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Features</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Everything You Need. Nothing You Don't.</h2>
            <p className="mt-4 text-muted-foreground">Twelve premium tools that replace a dozen browser tabs and three spreadsheets.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow"><f.icon className="h-5 w-5" /></div>
                <div className="mt-4 font-bold">{f.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="border-y border-border bg-gradient-brand py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Real Outcomes</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Numbers That Move Careers</h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {RESULTS.map(r => (
              <div key={r.label} className="rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur">
                <div className="text-4xl font-extrabold md:text-5xl">{r.stat}</div>
                <div className="mt-2 text-sm font-semibold text-white/90">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Success Stories</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Loved by 50,000+ Job Seekers</h2>
            <p className="mt-4 text-muted-foreground">Real results from real users across every role and region.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-1">{[...Array(5)].map((_,i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="mt-5 inline-flex rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">{t.result}</div>
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-warm text-sm font-extrabold text-white">{t.name[0]}</div>
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLACEMENT WALL */}
      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Placement Wall</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Our Users Get Hired Here</h2>
          <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {COMPANIES.map(c => (
              <div key={c} className="grid h-20 place-items-center rounded-xl border border-border bg-card text-base font-bold text-foreground/80 transition-all hover:border-primary/50 hover:text-foreground hover:shadow-glow md:text-lg">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-gradient-warm">
              <div className="absolute inset-0 grid place-items-center text-7xl font-extrabold text-white/90">OJ</div>
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-black/40 p-3 backdrop-blur">
                <div className="text-sm font-bold text-white">Founder & CEO</div>
                <div className="text-xs text-white/80">Building OkJobs since 2024</div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Meet The Founder</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Why I Built OkJobs</h2>
            <div className="mt-5 space-y-4 text-muted-foreground">
              <p>I spent six months applying to 400+ jobs after a layoff. I built spreadsheets, paid for resume coaches, and still got ghosted. The system was opaque, brutal, and totally disconnected from how recruiters actually hire.</p>
              <p>OkJobs is the tool I wished I had — an AI Career OS that finds the right roles, writes resumes that pass ATS, and never lets a recruiter reply go unanswered.</p>
              <p><span className="font-semibold text-foreground">Mission:</span> Make a great career outcome accessible to anyone, anywhere.</p>
              <p><span className="font-semibold text-foreground">Vision:</span> A world where job seekers spend their time preparing for interviews, not chasing applications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="border-y border-border bg-card/30 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Comparison</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Traditional Job Search vs OkJobs</h2>
          </div>
          <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-3 border-b border-border bg-muted/30 px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <div>Workflow</div>
              <div>Traditional</div>
              <div className="text-primary">OkJobs</div>
            </div>
            {COMPARISON.map(c => (
              <div key={c.row} className="grid grid-cols-3 items-center gap-4 border-b border-border px-6 py-5 text-sm last:border-b-0">
                <div className="font-bold">{c.row}</div>
                <div className="flex items-start gap-2 text-muted-foreground"><X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> {c.old}</div>
                <div className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> <span>{c.okj}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Pricing</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Simple, Honest, Scales With You</h2>
            <p className="mt-4 text-muted-foreground">Start free. Upgrade when you're winning.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Free", price: "$0", tag: "Forever", feats: ["10 AI resumes/mo","Basic job discovery","Application tracker","Email support"], cta: ctaLabel },
              { name: "Pro", price: "$19", tag: "/month", feats: ["Unlimited AI resumes","Career Inbox","Follow-up automation","Daily briefings","Priority support"], cta: "Start Pro", featured: true },
              { name: "Career+", price: "$49", tag: "/month", feats: ["Everything in Pro","1:1 resume reviews","Mock interview AI","Salary negotiation coach","Concierge onboarding"], cta: "Go Career+" },
            ].map(p => (
              <div key={p.name} className={`relative rounded-2xl border bg-card p-7 ${p.featured ? "border-primary shadow-glow" : "border-border"}`}>
                {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-glow">Most Popular</div>}
                <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1"><div className="text-4xl font-extrabold">{p.price}</div><div className="text-sm text-muted-foreground">{p.tag}</div></div>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {p.feats.map(f => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}</li>)}
                </ul>
                <Link to={ctaHref} className={`mt-6 block rounded-xl px-4 py-3 text-center text-sm font-bold transition-transform hover:scale-[1.02] active:scale-[0.97] ${p.featured ? "bg-gradient-brand text-white shadow-glow" : "border border-border bg-background hover:bg-accent"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="border-y border-border bg-card/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Security & Privacy</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Your Data, Locked Down</h2>
            <p className="mt-4 text-muted-foreground">We treat your career like the high-stakes asset it is.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {SECURITY.map(s => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success"><s.icon className="h-5 w-5" /></div>
                <div className="mt-4 font-bold">{s.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section id="resources" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Career Resources</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Free Guides to Help You Land Faster</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map(r => (
              <Link key={r.title} to="/blog" className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white"><r.icon className="h-5 w-5" /></div>
                <div className="mt-4 font-bold">{r.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{r.desc}</div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-border bg-card/30 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">FAQ</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Questions, Answered</h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className="overflow-hidden rounded-2xl border border-border bg-card">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                  <span className="text-sm font-bold md:text-base">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-muted-foreground">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-brand opacity-30 blur-3xl" />
        </div>
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl">Your Next Role Is One <span className="bg-gradient-brand bg-clip-text text-transparent">OkJobs</span> Away</h2>
          <p className="mt-5 text-lg text-muted-foreground">Let AI handle the busy work while you focus on landing interviews and negotiating offers.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={ctaHref} className="group inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-7 py-4 text-base font-bold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-[0.97]">
              {ctaLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <button onClick={() => setDemoOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-4 text-base font-semibold hover:bg-accent">
              <Play className="h-4 w-4" /> Book Demo
            </button>
          </div>
        </div>
      </section>

      {/* PREMIUM FOOTER */}
      <PremiumFooter />

      {/* DEMO MODAL */}
      {demoOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md animate-fade-in" onClick={() => setDemoOpen(false)}>
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-background shadow-glow animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Close" onClick={() => setDemoOpen(false)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg bg-background/80 backdrop-blur hover:bg-accent">
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-video w-full bg-black">
              <iframe className="h-full w-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" title="OkJobs demo" allow="autoplay; encrypted-media" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-4 shadow-glow">
      <div className="flex items-center gap-1.5 pb-3">
        <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-gold/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <div className="ml-2 text-xs font-mono text-muted-foreground">okjobs.app/dashboard</div>
      </div>
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Good morning</div>
            <div className="text-lg font-extrabold">Your career command center</div>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">P</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[{n:"12",l:"Applies"},{n:"4",l:"Replies"},{n:"2",l:"Onsite"}].map(s => (
            <div key={s.l} className="rounded-lg border border-border bg-card p-3">
              <div className="bg-gradient-brand bg-clip-text text-xl font-extrabold text-transparent">{s.n}</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {[
            {co:"Stripe", role:"Sr. Frontend Eng", score:94, color:"text-success"},
            {co:"Databricks", role:"Product Manager", score:88, color:"text-success"},
            {co:"Atlassian", role:"Design Lead", score:81, color:"text-gold"},
          ].map(j => (
            <div key={j.co} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div>
                <div className="text-sm font-bold">{j.role}</div>
                <div className="text-xs text-muted-foreground">{j.co}</div>
              </div>
              <div className={`text-sm font-extrabold ${j.color}`}>{j.score}<span className="text-xs text-muted-foreground">/100</span></div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary"><Mail className="h-3.5 w-3.5" /> New recruiter reply · Stripe</div>
          <div className="mt-1 text-xs text-muted-foreground">"Hi! Would love to set up a chat this week..."</div>
        </div>
      </div>
    </div>
  );
}

function FakeScreenshot({ label, variant }: { label: string; variant: number }) {
  const palettes = [
    "from-primary/30 via-cyan/20 to-transparent",
    "from-gold/25 via-primary/20 to-transparent",
    "from-success/25 via-cyan/15 to-transparent",
    "from-cyan/30 via-primary/15 to-transparent",
  ];
  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br ${palettes[variant]}`}>
      <div className="absolute inset-4 rounded-lg border border-border bg-background/80 p-3 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-destructive/60" />
          <div className="h-2 w-2 rounded-full bg-gold/60" />
          <div className="h-2 w-2 rounded-full bg-success/60" />
          <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[...Array(3)].map((_,i) => (
            <div key={i} className="h-10 rounded-md border border-border bg-card" />
          ))}
        </div>
        <div className="mt-2 space-y-1.5">
          {[...Array(4)].map((_,i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-card p-2">
              <div className="h-6 w-6 rounded bg-gradient-brand" />
              <div className="h-2 flex-1 rounded bg-muted" />
              <div className="h-2 w-10 rounded bg-primary/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PremiumFooter() {
  const cols = [
    { title: "Product", links: [["Jobs","/jobs"],["Applications","/applications"],["Resume Builder","/resume-lab"],["Career Inbox","/recruiter-inbox"],["Calendar","/calendar"]] },
    { title: "Resources", links: [["Blog","/blog"],["ATS Guides","/blog"],["Career Guides","/blog"],["Interview Tips","/blog"],["Salary Guides","/blog"]] },
    { title: "Company", links: [["About","/about"],["Founder","/about"],["Contact","/about"],["Careers","/about"]] },
    { title: "Legal", links: [["Privacy","/privacy"],["Terms","/terms"],["Cookies","/privacy"],["Security","/privacy"]] },
  ] as const;
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">The AI Career Operating System. Discover, apply, track and land — all in one premium dashboard.</p>
            <div className="mt-5 flex items-center gap-2">
              {[Linkedin, Twitter, Youtube, Github].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card transition-colors hover:bg-accent">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <div className="text-sm font-bold">{c.title}</div>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {c.links.map(([label, href]) => (
                  <li key={label}><Link to={href} className="transition-colors hover:text-foreground">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} OkJobs. All rights reserved.</div>
          <div>Reach Your OkJobs.</div>
        </div>
      </div>
    </footer>
  );
}
