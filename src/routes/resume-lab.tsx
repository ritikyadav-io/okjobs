import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { Sparkles, FileDown, FileText, ArrowRight } from "lucide-react";
import { useState } from "react";
import { MOCK_JOBS } from "@/lib/mock-data";

export const Route = createFileRoute("/resume-lab")({
  head: () => ({ meta: [{ title: "Resume Lab — Zenith" }, { name: "description", content: "AI rewrites your resume per job and predicts the new ATS score." }] }),
  component: ResumeLab,
});

const STEPS = ["Select Job", "ATS Analysis", "AI Optimize", "Cover Letter", "Export"];

function ResumeLab() {
  const [step, setStep] = useState(0);
  return (
    <AppShell>
      <PageHeader title="Resume Lab" description="AI rewrites your resume per job — and proves it on ATS." />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${i === step ? "border-primary bg-gradient-brand text-white shadow-glow" : "border-border bg-card hover:bg-accent"}`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {MOCK_JOBS.slice(0, 4).map((j) => (
            <button key={j.id} onClick={() => setStep(1)} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50">
              <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${j.logoBg} font-bold text-white`}>{j.company[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{j.title}</div>
                <div className="truncate text-xs text-muted-foreground">{j.company} · {j.location}</div>
              </div>
              <span className="font-extrabold text-primary">{j.atsScore}%</span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-border bg-card p-5">
            <h3 className="text-lg font-bold">Missing keywords</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {["GraphQL", "Postgres", "CI/CD", "Tailwind", "Playwright"].map((k) => (
                <span key={k} className="rounded-full bg-danger/15 px-3 py-1 text-xs font-bold text-danger">– {k}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border-2 border-border bg-card p-5">
            <h3 className="text-lg font-bold">Matched keywords</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {["React", "TypeScript", "Node", "REST", "Figma", "Git", "Vite"].map((k) => (
                <span key={k} className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">✓ {k}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Current ATS</span>
              <span>Predicted after rewrite</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-3xl font-extrabold">
              <span className="text-danger">62%</span>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <span className="text-success">88%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-brand transition-all" style={{ width: "88%" }} />
            </div>
            <button onClick={() => setStep(2)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">
              <Sparkles className="h-4 w-4" /> Run AI optimize
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ResumePanel title="Original" tone="muted" body="• Built a web app using React and Node.\n• Worked on REST APIs.\n• Helped team with Figma designs and code reviews." />
          <ResumePanel
            title="AI Optimized"
            tone="primary"
            body="• Shipped a production React + TypeScript app to 12k MAU using GraphQL + Postgres on a Vercel CI/CD pipeline.\n• Designed and tested REST + GraphQL APIs with Playwright, cutting regressions 40%.\n• Translated Figma into a Tailwind design system used across 8 product surfaces."
            highlight={["GraphQL", "TypeScript", "Postgres", "CI/CD", "Playwright", "Tailwind"]}
          />
          <div className="lg:col-span-2 flex justify-end">
            <button onClick={() => setStep(3)} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">
              Generate cover letter <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl border-2 border-border bg-card p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold"><FileText className="h-5 w-5 text-secondary" /> Cover letter</h3>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-background p-4 text-sm leading-relaxed">{`Hi Linear team,

I've been a daily user of Linear for two years — the keyboard-first workflow is exactly what I try to build. I'm applying for the Frontend Engineer role because I want to help craft that level of taste at scale.

In my last project I shipped a React + TypeScript app to 12k MAU and built a Tailwind design system used across 8 surfaces. The combination of speed, polish, and engineering rigor in your product is rare; I'd love to add to it.

Looking forward to talking,
Aarav`}</pre>
          <button onClick={() => setStep(4)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">
            Continue to export <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { i: FileDown, l: "Download PDF", c: "from-primary to-cyan" },
            { i: FileText, l: "Save to Google Docs", c: "from-secondary to-gold" },
            { i: Sparkles, l: "Copy to clipboard", c: "from-cyan to-success" },
          ].map((x) => (
            <button key={x.l} className={`group rounded-2xl border-2 border-border bg-card p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-glow`}>
              <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${x.c} text-white`}><x.i className="h-6 w-6" /></div>
              <div className="mt-3 font-bold">{x.l}</div>
              <div className="text-xs text-muted-foreground">Version v3 · saved 2 mins ago</div>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ResumePanel({ title, body, tone, highlight = [] }: { title: string; body: string; tone: "muted" | "primary"; highlight?: string[] }) {
  let html = body;
  highlight.forEach((h) => {
    html = html.replaceAll(h, `<mark class="rounded bg-success/30 px-1 text-success">${h}</mark>`);
  });
  return (
    <div className={`rounded-2xl border-2 p-5 ${tone === "primary" ? "border-primary/40 bg-gradient-to-br from-primary/5 to-card" : "border-border bg-card"}`}>
      <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
