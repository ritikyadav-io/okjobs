import { Sparkles, Zap, Rocket, Trophy } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel (no site name) */}
      <div className="relative hidden overflow-hidden bg-gradient-brand lg:flex lg:flex-col lg:p-10 lg:text-white">
        <div className="absolute inset-0 animated-grid opacity-20" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-cyan/40 blur-3xl" />
        <div className="relative mt-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> AI Career OS
          </div>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight">Land the role.<br/>Faster than ever.</h2>
          <p className="mt-3 max-w-md text-white/80">Auto-discovery, ATS optimization, recruiter monitoring, smart follow-ups. All on autopilot.</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { i: Zap, l: "Auto jobs" },
              { i: Rocket, l: "ATS rewrites" },
              { i: Trophy, l: "Offers" },
            ].map((x) => (
              <div key={x.l} className="rounded-xl border border-white/20 bg-white/10 p-3 text-center backdrop-blur">
                <x.i className="mx-auto h-5 w-5" />
                <div className="mt-1 text-xs font-semibold">{x.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form (no logo) */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}
