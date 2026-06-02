import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/zenith/Logo";
import { Check, ChevronRight, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — OkJobs" }, { name: "description", content: "Tell OkJobs about your career goals to unlock personalized job discovery." }] }),
  component: Onboarding,
});

const STEPS = ["Personal Info", "Career Preferences", "Your Skills"];
const SUGGESTED_SKILLS = ["React", "TypeScript", "Node.js", "Python", "SQL", "AWS", "Docker", "GraphQL", "Java", "Go", "Figma", "Product Management"];

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
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

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
        skills: profile.resume_skills?.length ? profile.resume_skills : f.skills,
      }));
    }
  }, [profile]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const addSkill = (raw: string) => {
    const s = raw.trim().replace(/,$/, "");
    if (!s) return;
    if (form.skills.includes(s)) return;
    if (form.skills.length >= 30) return;
    set("skills", [...form.skills, s]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => set("skills", form.skills.filter((x) => x !== s));

  // Per-step gating
  const canContinue = useMemo(() => {
    if (step === 0) return form.full_name.trim().length > 1 && form.phone.trim().length >= 6;
    if (step === 1) return form.preferred_role.trim().length > 1 && form.preferred_location.trim().length > 0;
    if (step === 2) return form.skills.length >= 3;
    return false;
  }, [step, form]);

  // Profile completeness (0-100)
  const completeness = useMemo(() => {
    const checks = [
      !!form.full_name.trim(),
      !!form.phone.trim(),
      !!form.linkedin.trim(),
      !!form.preferred_role.trim(),
      !!form.preferred_location.trim(),
      !!form.salary.trim(),
      form.skills.length >= 3,
      form.skills.length >= 6,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

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
        resume_skills: form.skills,
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
          <p className="mt-2 text-sm text-muted-foreground">Your dashboard is ready. We'll start surfacing matched jobs and recruiter activity right away.</p>
          <button onClick={() => nav({ to: "/dashboard" })} className="mt-6 w-full rounded-lg bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.97]">
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

      <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
        {/* Completeness */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Profile {completeness}% complete</span>
            <span className="text-muted-foreground">{completeness === 100 ? "All set" : "Keep going — better matches ahead"}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-brand transition-all duration-500" style={{ width: `${completeness}%` }} />
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold transition-all ${i <= step ? "bg-gradient-brand text-white shadow-glow" : "bg-card text-muted-foreground"}`}>
                {i < step ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </div>
              <div className="hidden text-sm font-semibold sm:block">{s}</div>
              {i < STEPS.length - 1 && <div className={`h-1 flex-1 rounded-full transition-all ${i < step ? "bg-gradient-brand" : "bg-card"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border-2 border-border bg-card p-5 md:p-8">
          {step === 0 && (
            <Section title="Tell us about you" subtitle="Basics first. We use this for autofill later.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field required label="Full Name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Your name" />
                <Field label="Email" type="email" value={user?.email ?? ""} disabled />
                <Field required label="Phone Number" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 90000 00000" />
                <Field label="LinkedIn URL" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/you" />
                <div className="sm:col-span-2"><Field label="Portfolio URL" value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="yoursite.com" /></div>
              </div>
            </Section>
          )}
          {step === 1 && (
            <Section title="Career preferences" subtitle="So we surface the right jobs.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field required label="Preferred Job Role" value={form.preferred_role} onChange={(e) => set("preferred_role", e.target.value)} placeholder="Frontend Engineer" />
                <Field required label="Preferred Location" value={form.preferred_location} onChange={(e) => set("preferred_location", e.target.value)} placeholder="Remote / Bangalore" />
                <Select label="Work Style" value={form.remote} onChange={(e) => set("remote", e.target.value as typeof form.remote)} options={["Remote", "Hybrid", "Onsite", "Any"]} />
                <Select label="Experience Level" value={form.experience} onChange={(e) => set("experience", e.target.value)} options={["Fresher", "0–1 yr", "1–3 yr", "3–5 yr", "5+ yr"]} />
                <div className="sm:col-span-2"><Field label="Expected Salary Range" value={form.salary} onChange={(e) => set("salary", e.target.value)} placeholder="₹15–25 LPA" /></div>
              </div>
            </Section>
          )}
          {step === 2 && (
            <Section title="Your top skills" subtitle="Add at least 3. Press Enter or comma to add.">
              <div className="rounded-xl border border-border bg-background p-3">
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((s) => (
                    <span key={s} className="group inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary animate-scale-in">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`} className="rounded-full p-0.5 transition-colors hover:bg-primary/20">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={skillInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.endsWith(",")) addSkill(v); else setSkillInput(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }
                      else if (e.key === "Backspace" && !skillInput && form.skills.length) {
                        removeSkill(form.skills[form.skills.length - 1]);
                      }
                    }}
                    placeholder={form.skills.length ? "Add another…" : "Type a skill and press Enter"}
                    className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs font-semibold text-muted-foreground">Suggested</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.filter((s) => !form.skills.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" /> {s}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{form.skills.length}/3 minimum · You can edit these any time in Settings.</p>
            </Section>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40 hover:bg-accent">
              Back
            </button>
            <button
              onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : save())}
              disabled={saving || !canContinue}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-5 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
function Field({ label, required, ...rest }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}{required && <span className="text-danger"> *</span>}</span>
      <input {...rest} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary disabled:opacity-60" />
    </label>
  );
}
function Select({ label, options, ...rest }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <select {...rest} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
