/**
 * Single-user stub. There is no authentication in this app.
 * Every consumer gets the same fixed user. `signOut` is a no-op.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SINGLE_USER_ID } from "@/lib/single-user";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  portfolio: string | null;
  preferred_role: string | null;
  resume_skills: string[] | null;
  plan: string | null;
};

type AuthCtx = {
  user: { id: string; email: string } | null;
  session: { user: { id: string; email: string } } | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const FAKE_USER = { id: SINGLE_USER_ID, email: "you@okjobs.local" };
const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", SINGLE_USER_ID).maybeSingle();
    setProfile((data as Profile) ?? null);
    setLoading(false);
  };

  useEffect(() => { loadProfile(); }, []);

  return (
    <Ctx.Provider
      value={{
        user: FAKE_USER,
        session: { user: FAKE_USER },
        profile,
        loading,
        signOut: async () => {},
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
