import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { User, Bell, Plug, CreditCard, Shield, Check } from "lucide-react";
import { useState } from "react";

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
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("profile");
  return (
    <AppShell>
      <PageHeader title="Settings" />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${tab === t.id ? "bg-gradient-brand text-white shadow-glow" : "hover:bg-accent"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border-2 border-border bg-card p-6">
          {tab === "profile" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" defaultValue="Aarav Sharma" />
              <Field label="Email" defaultValue="aarav@zenith.app" />
              <Field label="Phone" defaultValue="+91 90000 00000" />
              <Field label="LinkedIn" defaultValue="linkedin.com/in/aarav" />
              <Field label="Portfolio" defaultValue="aarav.dev" />
              <Field label="Preferred role" defaultValue="Frontend Engineer" />
              <div className="sm:col-span-2"><button className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">Save changes</button></div>
            </div>
          )}
          {tab === "notifications" && (
            <div className="space-y-4">
              <Toggle label="Daily briefing email" desc="Sent every day at 8 AM" defaultOn />
              <Toggle label="New job match notifications" desc="When 5+ new jobs match your filters" defaultOn />
              <Toggle label="Recruiter reply alerts" desc="Real-time when Gmail detects a recruiter email" defaultOn />
              <Toggle label="Followup reminders" desc="Suggest follow-ups every 5 days" />
            </div>
          )}
          {tab === "accounts" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { name: "Gmail", status: "Connected", on: true },
                { name: "Google Calendar", status: "Connected", on: true },
                { name: "Google Docs", status: "Not connected", on: false },
                { name: "Google Sheets", status: "Not connected", on: false },
                { name: "Resend", status: "Connected", on: true },
                { name: "Firecrawl", status: "Connected", on: true },
              ].map((a) => (
                <div key={a.name} className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                  <div>
                    <div className="font-semibold">{a.name}</div>
                    <div className={`text-xs font-bold ${a.on ? "text-success" : "text-muted-foreground"}`}>{a.status}</div>
                  </div>
                  <button className={`rounded-lg px-3 py-1.5 text-xs font-bold ${a.on ? "border border-border" : "bg-gradient-brand text-white shadow-glow"}`}>
                    {a.on ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          )}
          {tab === "plan" && (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { n: "Free", p: "₹0", on: true },
                { n: "Pro", p: "₹499", on: false, hot: true },
                { n: "Premium", p: "₹999", on: false },
              ].map((p) => (
                <div key={p.n} className={`rounded-2xl border-2 p-5 ${p.hot ? "border-primary bg-gradient-to-b from-primary/10 to-card shadow-glow" : "border-border bg-background"}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground">{p.n}</div>
                  <div className="mt-1 text-3xl font-extrabold">{p.p}<span className="text-sm text-muted-foreground">/mo</span></div>
                  <button className={`mt-4 w-full rounded-lg py-2 text-sm font-semibold ${p.on ? "border border-border" : "bg-gradient-brand text-white shadow-glow"}`}>
                    {p.on ? <span className="inline-flex items-center gap-1"><Check className="h-4 w-4" /> Current plan</span> : `Upgrade to ${p.n}`}
                  </button>
                </div>
              ))}
            </div>
          )}
          {tab === "privacy" && (
            <div className="space-y-3">
              <button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">Change password</button>
              <button className="block rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">Export all data</button>
              <button className="block rounded-lg border-2 border-danger/40 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/20">Delete account</button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
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
function Toggle({ label, desc, defaultOn = false }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
      <div>
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button onClick={() => setOn(!on)} className={`h-6 w-11 rounded-full transition-colors ${on ? "bg-gradient-brand" : "bg-muted"}`}>
        <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
