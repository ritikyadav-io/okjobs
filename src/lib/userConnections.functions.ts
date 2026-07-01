import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/single-user";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";

// All Google APIs share one OAuth client + one connection. Scopes are requested up front.
const DEFAULT_GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/documents",
];

export const startGoogleConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ targetOrigin: z.string().url() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const clientId = process.env.GOOGLE_APP_USER_CONNECTOR_CLIENT_ID;
    if (!clientId) {
      throw new Error(
        "Google sign-in is not configured yet. Ask the admin to add the GOOGLE_APP_USER_CONNECTOR_CLIENT_ID secret.",
      );
    }
    const { authorizeAppUserOAuth } = await import("@/integrations/lovable/appUserConnector");
    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: "google",
      appUserId: context.userId,
      connectorClientId: clientId,
      returnUrl: `${data.targetOrigin}/settings`,
      responseMode: "web_message",
      webMessageTargetOrigin: data.targetOrigin,
      credentialsConfiguration: { scopes: DEFAULT_GOOGLE_SCOPES },
    });
    return { authorizationUrl };
  });

export const saveGoogleConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ connectionId: z.string().min(1).max(500) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Look up the email associated with the new connection so we can show it in the UI.
    let email: string | null = null;
    try {
      const { callAsAppUser } = await import("@/integrations/lovable/appUserConnector");
      const res = await callAsAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionId: data.connectionId,
        connectorId: "google_mail",
        path: "/gmail/v1/users/me/profile",
      });
      if (res.ok) {
        const j = await res.json();
        email = (j.emailAddress as string | undefined)?.toLowerCase() ?? null;
      }
    } catch (e) {
      console.warn("[google] profile lookup failed", e);
    }

    const { error } = await supabase
      .from("user_google_connections" as any)
      .upsert(
        {
          user_id: userId,
          connection_id: data.connectionId,
          email,
          scopes: [
            "gmail.readonly",
            "gmail.modify",
            "calendar",
            "drive.file",
            "documents",
          ],
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true, email };
  });

export const getMyGoogleConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_google_connections" as any)
      .select("connection_id, email, scopes, created_at, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    return { connection: (data as any) ?? null };
  });

export const disconnectGoogle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("user_google_connections" as any)
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
