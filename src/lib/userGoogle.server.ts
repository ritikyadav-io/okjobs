/**
 * Per-user Google connection helpers. Server-only.
 * Looks up a user's connection_id from user_google_connections, then issues
 * gateway calls scoped to that user via callAsAppUser.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { callAsAppUser } from "@/integrations/lovable/appUserConnector";

export const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";

export type GoogleConnectorId =
  | "google_mail"
  | "google_calendar"
  | "google_docs"
  | "google_drive";

export class GoogleNotConnectedError extends Error {
  constructor(public readonly userId: string) {
    super("Google account not connected. Connect Google in Settings → Connected accounts.");
    this.name = "GoogleNotConnectedError";
  }
}

export async function getUserGoogleConnection(userId: string): Promise<{ connectionId: string; email: string | null; scopes: string[] } | null> {
  const { data } = await supabaseAdmin
    .from("user_google_connections" as any)
    .select("connection_id, email, scopes")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  const row = data as any;
  return { connectionId: row.connection_id, email: row.email ?? null, scopes: row.scopes ?? [] };
}

export async function requireUserGoogleConnectionId(userId: string): Promise<string> {
  const conn = await getUserGoogleConnection(userId);
  if (!conn) throw new GoogleNotConnectedError(userId);
  return conn.connectionId;
}

export async function callUserGoogle(opts: {
  userId: string;
  connectorId: GoogleConnectorId;
  path: string;
  init?: RequestInit;
}): Promise<Response> {
  const connectionId = await requireUserGoogleConnectionId(opts.userId);
  return callAsAppUser({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectionId,
    connectorId: opts.connectorId,
    path: opts.path,
    init: opts.init,
  });
}

export async function listUsersWithGoogleConnection(): Promise<Array<{ userId: string; connectionId: string }>> {
  const { data } = await supabaseAdmin
    .from("user_google_connections" as any)
    .select("user_id, connection_id");
  return ((data as any[]) ?? []).map((r) => ({ userId: r.user_id, connectionId: r.connection_id }));
}
