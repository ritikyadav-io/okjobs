import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { User, Bell, Plug, CreditCard, Shield, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Zenith" }, { name: "description", content: "Profile, notifications, connected accounts, plan, and privacy." }] }),
  component: SettingsPage,
});

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "accounts", label: "Connected accounts", icon: Plug },
  { id: "plan", label: "Subscription", icon: CreditCard },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
] as const;

function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("profile");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", linkedin: "", portfolio: "", preferred_role: "", skills: "" });

  useEffect(() => {
    setForm({
      full_name: profile?.full_name ?? user?.user_metadata?.full_name ?? "",
      email: profile?.email ?? user?.email ?? "",
      phone: profile?.phone ?? "",
      linkedin: profile?.linkedin ?? "",
      portfolio: profile?.portfolio ?? "",
      preferred_role: profile?.preferred_role ?? "",
      skills: (profile?.resume_skills ?? []).join(", "),
    });
  }, [profile, user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
      linkedin: form.linkedin,
      portfolio: form.portfolio,
      preferred_role: form.preferred_role,
      resume_skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Profile saved");
  };

  return (
    <AppShell>
      <PageHeader title="Settings" />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {TABS.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${tab === t.id ? "bg-gradient-brand text-white shadow-glow" : "hover:bg-accent"}`}><t.icon className="h-4 w-4" /> {t.label}</button>)}
        </nav>
        <div className="rounded-2xl border-2 border-border bg-card p-6">
          {tab === "profile" && <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <Field label="Email" value={form.email} disabled />
            <Field label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Field label="LinkedIn" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
            <Field label="Portfolio" value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} />
            <Field label="Preferred role" value={form.preferred_role} onChange={(e) => setForm({ ...form, preferred_role: e.target.value })} />
            <label className="block sm:col-span-2"><span className="text-xs font-semibold text-muted-foreground">Skills</span><textarea value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="mt-1 min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
            <div className="sm:col-span-2"><button onClick={save} disabled={saving} className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button></div>
          </div>}
          {tab === "notifications" && <div className="space-y-4"><Toggle label="Daily briefing email" desc="Sent every day at 8 AM" defaultOn /><Toggle label="Recruiter reply alerts" desc="Live when Gmail detects recruiter email" defaultOn /><Toggle label="Follow-up reminders" desc="Google Calendar reminders for due follow-ups" defaultOn /></div>}
          {tab === "accounts" && <div className="grid gap-3 sm:grid-cols-2">{["Gmail", "Google Calendar", "Google Docs", "Resend", "Firecrawl"].map((name) => <div key={name} className="flex items-center justify-between rounded-xl border border-border bg-background p-4"><div><div className="font-semibold">{name}</div><div className="text-xs font-bold text-success">Connected</div></div><span className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">Managed</span></div>)}</div>}
          {tab === "plan" && <div className="rounded-2xl border-2 border-border bg-background p-5"><div className="text-xs font-bold uppercase text-muted-foreground">Current plan</div><div className="mt-1 text-3xl font-extrabold">{profile?.plan ?? "Free"}</div><div className="mt-4 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold"><Check className="h-4 w-4" /> Active</div></div>}
          {tab === "privacy" && <div className="space-y-3"><button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">Change password</button><button className="block rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">Export all data</button></div>}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block"><span className="text-xs font-semibold text-muted-foreground">{label}</span><input {...rest} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-60" /></label>;
}
function Toggle({ label, desc, defaultOn = false }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4"><div><div className="font-semibold">{label}</div><div className="text-xs text-muted-foreground">{desc}</div></div><button onClick={() => setOn(!on)} className={`h-6 w-11 rounded-full transition-colors ${on ? "bg-gradient-brand" : "bg-muted"}`}><span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} /></button></div>;
}
