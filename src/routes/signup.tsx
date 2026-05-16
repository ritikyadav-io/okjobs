import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/zenith/AuthLayout";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Zenith" }, { name: "description", content: "Create your Zenith account and start landing interviews." }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin + "/onboarding",
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created. Check your email to verify your account, then log in.");
    nav({ to: "/login" });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error(result.error.message ?? "Google sign-in failed"); return; }
    if (!result.redirected) nav({ to: "/onboarding" });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start landing interviews in days, not weeks."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary">Log in</Link></>}
    >
      <button onClick={onGoogle} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-border bg-card py-2.5 text-sm font-semibold hover:bg-accent">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-extrabold text-[#4285F4]">G</span>
        Continue with Google
      </button>
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Full name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required />
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
        <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
        <button disabled={loading} className="w-full rounded-lg bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input {...rest} className="mt-1 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
    </label>
  );
}
