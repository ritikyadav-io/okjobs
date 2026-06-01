import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/zenith/AuthLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — OkJobs" }, { name: "description", content: "Log in to your OkJobs account." }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) nav({ to: "/dashboard" });
  }, [user, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    nav({ to: "/dashboard" });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error(result.error.message ?? "Google sign-in failed"); return; }
    if (!result.redirected) nav({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep climbing."
      footer={<>New here? <Link to="/signup" className="font-semibold text-primary">Create account</Link></>}
    >
      <button onClick={onGoogle} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-border bg-card py-2.5 text-sm font-semibold hover:bg-accent">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-extrabold text-[#4285F4]">G</span>
        Continue with Google
      </button>
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="mt-1 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Password</span>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
        </label>
        <button disabled={loading} className="w-full rounded-lg bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
