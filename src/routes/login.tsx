import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/zenith/AuthLayout";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Zenith" }, { name: "description", content: "Log in to your Zenith account." }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => nav({ to: "/dashboard" }), 500);
  };
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep climbing."
      footer={<>New here? <Link to="/signup" className="font-semibold text-primary">Create account</Link></>}
    >
      <button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-border bg-card py-2.5 text-sm font-semibold hover:bg-accent">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-extrabold text-[#4285F4]">G</span>
        Continue with Google
      </button>
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Email</span>
          <input type="email" placeholder="you@email.com" className="mt-1 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Password</span>
            <a href="#" className="text-xs font-semibold text-primary">Forgot?</a>
          </div>
          <input type="password" placeholder="••••••••" className="mt-1 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
        </label>
        <button disabled={loading} className="w-full rounded-lg bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
