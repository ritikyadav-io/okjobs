import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateSuggestedReplyText, syncRecruiterEmailsForUser } from "@/lib/automation.server";
import { callUserGoogle, GoogleNotConnectedError } from "@/lib/userGoogle.server";

export const syncRecruiterEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      return await syncRecruiterEmailsForUser(context.supabase as any, context.userId);
    } catch (e) {
      if (e instanceof GoogleNotConnectedError) {
        throw new Error("Connect your Google account in Settings → Connected accounts to sync your inbox.");
      }
      throw e;
    }
  });

export const listRecruiterEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("recruiter_emails").select("*").eq("user_id", userId).order("received_at", { ascending: false }).limit(300);
    if (error) throw new Error(error.message);
    return { emails: data ?? [] };
  });

export const updateEmailReplyStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["unread", "read", "replied", "handled"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase.from("recruiter_emails").select("gmail_message_id").eq("id", data.id).eq("user_id", userId).maybeSingle();
    const { error } = await supabase.from("recruiter_emails").update({ reply_status: data.status }).eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    if (data.status !== "unread" && row?.gmail_message_id) {
      try {
        await callUserGoogle({ userId, connectorId: "google_mail", path: `/gmail/v1/users/me/messages/${row.gmail_message_id}/modify`, init: { method: "POST", body: JSON.stringify({ removeLabelIds: ["UNREAD"] }) } });
      } catch { /* tolerate if Google not connected */ }
    }
    return { ok: true };
  });

export const archiveRecruiterEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), archived: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase.from("recruiter_emails").select("gmail_message_id").eq("id", data.id).eq("user_id", userId).maybeSingle();
    const { error } = await supabase.from("recruiter_emails").update({ archived: data.archived } as any).eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    if (data.archived && row?.gmail_message_id) {
      try {
        await callUserGoogle({ userId, connectorId: "google_mail", path: `/gmail/v1/users/me/messages/${row.gmail_message_id}/modify`, init: { method: "POST", body: JSON.stringify({ removeLabelIds: ["INBOX"] }) } });
      } catch { /* tolerate */ }
    }
    return { ok: true };
  });

export const bulkUpdateEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      ids: z.array(z.string().uuid()).min(1).max(200),
      action: z.enum(["archive", "unarchive", "read", "unread", "handled", "delete"]),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.action === "delete") {
      const { error } = await supabase.from("recruiter_emails").delete().in("id", data.ids).eq("user_id", userId);
      if (error) throw new Error(error.message);
      return { ok: true, count: data.ids.length };
    }
    const patch: Record<string, unknown> = {};
    if (data.action === "archive") patch.archived = true;
    if (data.action === "unarchive") patch.archived = false;
    if (data.action === "read") patch.reply_status = "read";
    if (data.action === "unread") patch.reply_status = "unread";
    if (data.action === "handled") patch.reply_status = "handled";
    const { error } = await supabase.from("recruiter_emails").update(patch as any).in("id", data.ids).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true, count: data.ids.length };
  });

export const generateSuggestedReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ emailId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: email }, { data: profile }] = await Promise.all([
      supabase.from("recruiter_emails").select("subject, body, sender, type").eq("id", data.emailId).eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    ]);
    if (!email) throw new Error("Email not found");
    const reply = await generateSuggestedReplyText({ subject: email.subject ?? "", body: email.body ?? "", sender: email.sender ?? "", type: email.type ?? "", userName: profile?.full_name ?? "" });
    return { reply };
  });

export const summarizeRecruiterEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ emailId: z.string().uuid(), force: z.boolean().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: email, error: fetchErr } = await supabase
      .from("recruiter_emails")
      .select("id, subject, body, sender, type, ai_summary, ai_highlights")
      .eq("id", data.emailId)
      .eq("user_id", userId)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!email) throw new Error("Email not found");
    const row = email as any;
    if (!data.force && row.ai_summary && Array.isArray(row.ai_highlights)) {
      return { summary: row.ai_summary as string, highlights: row.ai_highlights as string[] };
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured yet. Try again shortly.");
    const prompt = `Summarize this recruiter email in 2 short sentences and extract 3-5 key highlights (deadlines, next steps, names, links).\nReturn STRICT JSON: {"summary": string, "highlights": string[]}.\n\nSubject: ${row.subject ?? ""}\nFrom: ${row.sender ?? ""}\nType: ${row.type ?? ""}\n\nBody:\n${(row.body ?? "").slice(0, 6000)}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a precise assistant for a job seeker. Always reply with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (res.status === 429) throw new Error("AI rate limit hit — please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted — please add credits to continue.");
    if (!res.ok) throw new Error(`AI summarization failed (${res.status}).`);
    const json: any = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { summary?: string; highlights?: string[] } = {};
    try { parsed = JSON.parse(text); } catch { parsed = { summary: text.slice(0, 280), highlights: [] }; }
    const summary = (parsed.summary ?? "").slice(0, 600);
    const highlights = Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 6).map((h) => String(h).slice(0, 200)) : [];
    await supabase.from("recruiter_emails").update({ ai_summary: summary, ai_highlights: highlights } as any).eq("id", row.id).eq("user_id", userId);
    return { summary, highlights };
  });

export const deleteRecruiterEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase.from("recruiter_emails").select("gmail_message_id").eq("id", data.id).eq("user_id", userId).maybeSingle();
    const { error } = await supabase.from("recruiter_emails").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    if (row?.gmail_message_id) {
      try {
        await callUserGoogle({ userId, connectorId: "google_mail", path: `/gmail/v1/users/me/messages/${row.gmail_message_id}/trash`, init: { method: "POST" } });
      } catch { /* tolerate */ }
    }
    return { ok: true };
  });
