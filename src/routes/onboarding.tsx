import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/zenith/Logo";
import { Check, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — OkJob" }, { name: "description", content: "Tell OkJob about your career goals to unlock personalized job discovery." }] }),
  component: Onboarding,
});

const STEPS = ["Personal Info", "Career Preferences", "Resume Skills"];

function Onboarding() {
  const nav = useNavigate();
  const { user, loading: authLoading, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    preferred_role: "",
    preferred_location: "",
    remote: "Remote" as "Remote" | "Hybrid" | "Onsite" | "Any",
    experience: "0–1 yr",
    salary: "",
    skills: "",
  });

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/signup" });
  }, [authLoading, user, nav]);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        full_name: profile.full_name ?? f.full_name,
        phone: profile.phone ?? f.phone,
        linkedin: profile.linkedin ?? f.linkedin,
        portfolio: profile.portfolio ?? f.portfolio,
        preferred_role: profile.preferred_role ?? f.preferred_role,
        skills: (profile.resume_skills ?? []).join(", "),
      }));
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        linkedin: form.linkedin,
        portfolio: form.portfolio,
        preferred_role: form.preferred_role,
        resume_skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    setDone(true);
  };

  if (done) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border-2 border-success/40 bg-gradient-to-b from-success/10 to-card p-8 text-center shadow-glow">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success text-white">
            <Check className="h-7 w-7" strokeWidth={3} />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold">You're all set!</h2>
          <p className="mt-2 text-sm text-muted-foreground">Connect Firecrawl & Gmail next to start discovering real jobs and recruiter emails.</p>
          <button onClick={() => nav({ to: "/dashboard" })} className="mt-6 w-full rounded-lg bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow">
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/"><Logo /></Link>
          <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
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
                <Field label="Full Name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Your name" />
                <Field label="Email" type="email" value={user?.email ?? ""} disabled />
                <Field label="Phone Number" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 90000 00000" />
                <Field label="LinkedIn URL" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/you" />
                <div className="sm:col-span-2"><Field label="Portfolio URL" value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="yoursite.com" /></div>
              </div>
            </Section>
          )}
          {step === 1 && (
            <Section title="Career preferences" subtitle="So we surface the right jobs.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preferred Job Role" value={form.preferred_role} onChange={(e) => set("preferred_role", e.target.value)} placeholder="Frontend Engineer" />
                <Field label="Preferred Location" value={form.preferred_location} onChange={(e) => set("preferred_location", e.target.value)} placeholder="Remote / Bangalore" />
                <Select label="Remote / Hybrid / Onsite" value={form.remote} onChange={(e) => set("remote", e.target.value as typeof form.remote)} options={["Remote", "Hybrid", "Onsite", "Any"]} />
                <Select label="Experience Level" value={form.experience} onChange={(e) => set("experience", e.target.value)} options={["Fresher", "0–1 yr", "1–3 yr", "3–5 yr", "5+ yr"]} />
                <div className="sm:col-span-2"><Field label="Expected Salary Range" value={form.salary} onChange={(e) => set("salary", e.target.value)} placeholder="₹15–25 LPA" /></div>
              </div>
            </Section>
          )}
          {step === 2 && (
            <Section title="Your top skills" subtitle="Comma-separated. We use these to score jobs.">
              <textarea
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
                rows={5}
                placeholder="React, TypeScript, Node.js, GraphQL, PostgreSQL, AWS"
                className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              />
              <p className="mt-2 text-xs text-muted-foreground">You can edit these any time in Settings.</p>
            </Section>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40">
              Back
            </button>
            <button
              onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : save())}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-5 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            >
              {step < STEPS.length - 1 ? "Continue" : saving ? "Saving…" : "Finish setup"} <ChevronRight className="h-4 w-4" />
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
      <input {...rest} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-60" />
    </label>
  );
}
function Select({ label, options, ...rest }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <select {...rest} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
