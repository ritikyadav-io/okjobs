import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { User, Bell, Plug, CreditCard, Shield, Check, Sheet } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SheetsMappingCard } from "@/components/zenith/SheetsMappingCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { startGoogleConnect, saveGoogleConnection, getMyGoogleConnection, disconnectGoogle } from "@/lib/userConnections.functions";
import { connectAppUser } from "@/integrations/lovable/appUserConnectorClient";


export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — OkJobs" }, { name: "description", content: "Profile, notifications, connected accounts, plan, and privacy." }] }),
  component: SettingsPage,
});

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "accounts", label: "Connected accounts", icon: Plug },
  { id: "sheets", label: "Google Sheets", icon: Sheet },
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
      full_name: profile?.full_name ?? "",
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
          {tab === "accounts" && <ConnectedAccounts />}
          {tab === "sheets" && <SheetsMappingCard />}
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

const SCOPE_BADGES = [
  { key: "gmail", label: "Gmail" },
  { key: "calendar", label: "Calendar" },
  { key: "drive.file", label: "Drive" },
  { key: "documents", label: "Docs" },
] as const;

function ConnectedAccounts() {
  const qc = useQueryClient();
  const startFn = useServerFn(startGoogleConnect);
  const saveFn = useServerFn(saveGoogleConnection);
  const getFn = useServerFn(getMyGoogleConnection);
  const disconnectFn = useServerFn(disconnectGoogle);

  const conn = useQuery({ queryKey: ["my-google-connection"], queryFn: () => getFn() });
  const current = (conn.data as any)?.connection ?? null;

  const connect = useMutation({
    mutationFn: async () => {
      const result = await connectAppUser({
        connectorId: "google",
        gatewayBaseUrl: "https://connector-gateway.lovable.dev",
        start: (targetOrigin) => startFn({ data: { targetOrigin } }),
      });
      if (!result.success) throw new Error(result.error || "Sign in failed");
      await saveFn({ data: { connectionId: result.connectionId! } });
    },
    onSuccess: () => { toast.success("Google account connected"); qc.invalidateQueries({ queryKey: ["my-google-connection"] }); },
    onError: (e: any) => toast.error(e.message ?? "Could not connect Google"),
  });

  const disconnect = useMutation({
    mutationFn: () => disconnectFn(),
    onSuccess: () => { toast.success("Google account disconnected"); qc.invalidateQueries({ queryKey: ["my-google-connection"] }); },
    onError: (e: any) => toast.error(e.message ?? "Could not disconnect"),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-border bg-background p-4 text-xs text-muted-foreground">
        Each user connects their <span className="font-semibold text-foreground">own</span> Google account. OkJobs never reads another user's mailbox, Drive, calendar, or Docs.
      </div>

      <div className="rounded-2xl border-2 border-border bg-background p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-base font-bold">Google account</div>
            <div className="mt-1 text-sm text-muted-foreground">
              One sign-in unlocks Gmail (Career Inbox), Calendar (interviews + reminders), Drive + Docs (resume exports).
            </div>
            {current ? (
              <div className="mt-3 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-success">
                  Connected{current.email ? ` · ${current.email}` : ""}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SCOPE_BADGES.map((s) => (
                    <span key={s.key} className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{s.label}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Not connected
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {current ? (
              <>
                <button onClick={() => connect.mutate()} disabled={connect.isPending} className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-60">
                  Reconnect
                </button>
                <button onClick={() => disconnect.mutate()} disabled={disconnect.isPending} className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-60">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={() => connect.mutate()} disabled={connect.isPending} className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow disabled:opacity-60">
                {connect.isPending ? "Connecting…" : "Connect Google"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
