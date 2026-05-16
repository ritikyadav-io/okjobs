import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GMAIL_GW = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

function gwHeaders() {
  const lk = process.env.LOVABLE_API_KEY;
  const gk = process.env.GOOGLE_MAIL_API_KEY;
  if (!lk) throw new Error("LOVABLE_API_KEY missing");
  if (!gk) throw new Error("Gmail not connected");
  return { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": gk, "Content-Type": "application/json" };
}

function decodeB64Url(s: string): string {
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    return Buffer.from((s + pad).replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  } catch { return ""; }
}

function classify(subject: string, body: string): "Interview Invite" | "Rejection" | "Follow-up Request" | "Offer" | "Ghost" {
  const t = `${subject}\n${body}`.toLowerCase();
  if (/\boffer\b|offer letter|congratulations on/.test(t)) return "Offer";
  if (/interview|schedule.*call|invite.*chat|availability/.test(t)) return "Interview Invite";
  if (/unfortunately|not moving forward|other candidates|we regret|decided not to/.test(t)) return "Rejection";
  if (/follow up|following up|gentle reminder|assessment|take.home/.test(t)) return "Follow-up Request";
  return "Ghost";
}

function extractCompany(from: string): string {
  const m = from.match(/@([\w-]+)\./);
  if (!m) return "Unknown";
  const c = m[1];
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export const syncRecruiterEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const headers = gwHeaders();

    // Query for likely recruiter emails
    const q = encodeURIComponent('newer_than:30d (subject:(interview OR offer OR application OR opportunity OR role OR position) OR from:(recruiting OR talent OR careers OR hr))');
    const listRes = await fetch(`${GMAIL_GW}/users/me/messages?maxResults=25&q=${q}`, { headers });
    if (!listRes.ok) throw new Error(`Gmail list failed: ${listRes.status} ${await listRes.text()}`);
    const list = await listRes.json();
    const ids: string[] = (list.messages ?? []).map((m: any) => m.id);

    let added = 0;
    for (const id of ids) {
      const { data: existing } = await supabase.from("recruiter_emails").select("id").eq("user_id", userId).eq("gmail_message_id", id).maybeSingle();
      if (existing) continue;

      const mRes = await fetch(`${GMAIL_GW}/users/me/messages/${id}?format=full`, { headers });
      if (!mRes.ok) continue;
      const msg = await mRes.json();
      const hdrs: Record<string, string> = {};
      for (const h of msg.payload?.headers ?? []) hdrs[h.name.toLowerCase()] = h.value;
      const subject = hdrs["subject"] ?? "";
      const from = hdrs["from"] ?? "";
      const dateMs = Number(msg.internalDate) || Date.now();

      // body extraction
      let body = "";
      const walk = (p: any) => {
        if (!p) return;
        if (p.body?.data) body += decodeB64Url(p.body.data) + "\n";
        if (Array.isArray(p.parts)) p.parts.forEach(walk);
      };
      walk(msg.payload);
      body = body.slice(0, 6000);

      const type = classify(subject, body);
      const company = extractCompany(from);
      const preview = (body.replace(/\s+/g, " ").trim()).slice(0, 200);

      await supabase.from("recruiter_emails").insert({
        user_id: userId,
        gmail_message_id: id,
        company,
        sender: from,
        subject,
        body,
        preview,
        type,
        reply_status: "unread",
        received_at: new Date(dateMs).toISOString(),
      });
      added++;
    }
    return { added, scanned: ids.length };
  });

export const listRecruiterEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("recruiter_emails")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { emails: data ?? [] };
  });

export const updateEmailReplyStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["unread", "read", "replied", "handled"]),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("recruiter_emails")
      .update({ reply_status: data.status })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);

    // Best-effort: mark as read in Gmail too
    if (data.status !== "unread") {
      try {
        const { data: row } = await supabase.from("recruiter_emails").select("gmail_message_id").eq("id", data.id).maybeSingle();
        if (row?.gmail_message_id) {
          await fetch(`${GMAIL_GW}/users/me/messages/${row.gmail_message_id}/modify`, {
            method: "POST",
            headers: gwHeaders(),
            body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
          });
        }
      } catch {}
    }
    return { ok: true };
  });
