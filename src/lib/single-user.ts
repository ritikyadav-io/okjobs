/**
 * Single-user mode. There is no authentication in this app.
 * Every server function uses this fixed UUID as the "current user".
 * All rows in every table belong to this one user.
 */
import { createMiddleware } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const SINGLE_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Drop-in replacement for `requireSupabaseAuth`.
 * Injects the single-user context without any auth check.
 * Uses the service-role admin client since RLS is disabled anyway.
 */
export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    return next({
      context: {
        supabase: supabaseAdmin,
        userId: SINGLE_USER_ID,
        claims: { sub: SINGLE_USER_ID, email: "you@okjobs.local" },
      },
    });
  },
);
