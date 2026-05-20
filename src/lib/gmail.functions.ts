import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateSuggestedReplyText, syncRecruiterEmailsForUser } from "@/lib/automation.server";

const GMAIL_GW = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

function gwHeaders() {
  const lk = process.env.LOVABLE_API_KEY;
  const gk = process.env.GOOGLE_MAIL_API_KEY;
  if (!lk) throw new Error("LOVABLE_API_KEY missing");
  if (!gk) throw new Error("Gmail not connected");
  return { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": gk, "Content-Type": "application/json" };
}

export const syncRecruiterEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => syncRecruiterEmailsForUser(context.supabase as any, context.userId));

export const listRecruiterEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("recruiter_emails").select("*").eq("user_id", userId).order("received_at", { ascending: false }).limit(100);
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
      await fetch(`${GMAIL_GW}/users/me/messages/${row.gmail_message_id}/modify`, { method: "POST", headers: gwHeaders(), body: JSON.stringify({ removeLabelIds: ["UNREAD"] }) }).catch(() => null);
    }
    return { ok: true };
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

export const deleteRecruiterEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase.from("recruiter_emails").select("gmail_message_id").eq("id", data.id).eq("user_id", userId).maybeSingle();
    const { error } = await supabase.from("recruiter_emails").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    if (row?.gmail_message_id) {
      // Trash in Gmail so reconciliation stays in sync.
      await fetch(`${GMAIL_GW}/users/me/messages/${row.gmail_message_id}/trash`, { method: "POST", headers: gwHeaders() }).catch(() => null);
    }
    return { ok: true };
  });

