import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/zenith/Logo";
import { Check, UploadCloud, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — Zenith" }, { name: "description", content: "Tell Zenith about your career goals to unlock personalized job discovery." }] }),
  component: Onboarding,
});

const STEPS = ["Personal Info", "Career Preferences", "Resume Upload"];

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border-2 border-success/40 bg-gradient-to-b from-success/10 to-card p-8 text-center shadow-glow">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success text-white">
            <Check className="h-7 w-7" strokeWidth={3} />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold">You're all set!</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your ATS baseline is <span className="font-bold text-success">74</span>. We'll start finding jobs for you right away.</p>
          <button onClick={() => nav({ to: "/dashboard" })} className="mt-6 w-full rounded-lg bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow">
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/"><Logo /></Link>
          <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-extrabold ${i <= step ? "bg-gradient-brand text-white shadow-glow" : "bg-card text-muted-foreground"}`}>
                {i < step ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </div>
              <div className="hidden text-sm font-semibold sm:block">{s}</div>
              {i < STEPS.length - 1 && <div className={`h-1 flex-1 rounded-full ${i < step ? "bg-gradient-brand" : "bg-card"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border-2 border-border bg-card p-6 md:p-8">
          {step === 0 && (
            <Section title="Tell us about you" subtitle="Basics first. We use this for autofill later.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" placeholder="Aarav Sharma" />
                <Field label="Email" type="email" placeholder="you@email.com" />
                <Field label="Phone Number" placeholder="+91 90000 00000" />
                <Field label="LinkedIn URL" placeholder="linkedin.com/in/you" />
                <div className="sm:col-span-2"><Field label="Portfolio URL" placeholder="yoursite.com" /></div>
              </div>
            </Section>
          )}
          {step === 1 && (
            <Section title="Career preferences" subtitle="So we surface the right jobs.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preferred Job Role" placeholder="Frontend Engineer" />
                <Field label="Preferred Location" placeholder="Remote / Bangalore" />
                <Select label="Remote / Hybrid / Onsite" options={["Remote", "Hybrid", "Onsite", "Any"]} />
                <Select label="Experience Level" options={["Fresher", "0–1 yr", "1–3 yr", "3–5 yr", "5+ yr"]} />
                <div className="sm:col-span-2"><Field label="Expected Salary Range" placeholder="₹15–25 LPA" /></div>
              </div>
            </Section>
          )}
          {step === 2 && (
            <Section title="Upload your resume" subtitle="We extract skills, projects, and set your ATS baseline.">
              <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-background p-10 text-center transition-colors hover:border-primary">
                <UploadCloud className="mx-auto h-10 w-10 text-primary" />
                <div className="mt-3 text-sm font-semibold">Drag & drop your PDF</div>
                <div className="text-xs text-muted-foreground">or click to browse · max 10MB</div>
                <input type="file" accept=".pdf" className="hidden" />
              </label>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Skills", "Projects", "Education", "Tools", "Certifications", "ATS Baseline"].map((t) => (
                  <div key={t} className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm">
                    <Sparkles className="h-4 w-4 text-gold" /> Auto-extract <span className="font-semibold">{t}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40">
              Back
            </button>
            <button
              onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : setDone(true))}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-5 py-2 text-sm font-semibold text-white shadow-glow"
            >
              {step < STEPS.length - 1 ? "Continue" : "Finish setup"} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input {...rest} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
    </label>
  );
}
function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <select className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
