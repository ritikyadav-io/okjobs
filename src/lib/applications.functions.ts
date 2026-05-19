import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mirrorApplicationsBackground } from "@/lib/sheets.functions";


const STATUSES = ["Saved", "Applying", "Applied", "OA Received", "Interview Scheduled", "Rejected", "Offer Received"] as const;

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { applications: data ?? [] };
  });

export const createApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      company: z.string().min(1).max(200),
      title: z.string().min(1).max(200),
      status: z.enum(STATUSES).optional(),
      ats_score: z.number().int().min(0).max(100).optional(),
      notes: z.string().max(4000).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error, data: row } = await supabase.from("applications").insert({
      user_id: userId,
      company: data.company,
      title: data.title,
      status: data.status ?? "Applied",
      ats_score: data.ats_score ?? 0,
      notes: data.notes,
      applied_at: new Date().toISOString(),
    }).select().single();
    if (error) throw new Error(error.message);
    mirrorApplicationsBackground(supabase as any, userId);
    return { application: row };
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(STATUSES),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("applications")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    mirrorApplicationsBackground(supabase as any, userId);
    return { ok: true };
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("applications").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    mirrorApplicationsBackground(supabase as any, userId);
    return { ok: true };
  });

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [apps, emails, events] = await Promise.all([
      supabase.from("applications").select("status, followup_sent, followup_date, interview_at, ats_score").eq("user_id", userId),
      supabase.from("recruiter_emails").select("reply_status, type").eq("user_id", userId),
      supabase.from("calendar_events").select("starts_at").eq("user_id", userId).gte("starts_at", new Date().toISOString()),
    ]);

    const a = apps.data ?? [];
    const e = emails.data ?? [];
    const ev = events.data ?? [];

    const byStatus: Record<string, number> = {};
    for (const s of STATUSES) byStatus[s] = 0;
    for (const row of a) byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;

    const unreadEmails = e.filter((x) => x.reply_status === "unread").length;
    const interviewInvites = e.filter((x) => x.type === "Interview Invite").length;
    const pendingFollowups = a.filter((x) => !x.followup_sent && x.followup_date).length;

    return {
      totalApplications: a.length,
      interviewsScheduled: ev.length,
      recruiterReplies: e.length,
      unreadEmails,
      interviewInvites,
      pendingFollowups,
      byStatus,
    };
  });
