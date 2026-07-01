import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/lib/single-user";
import { buildBriefingData, sendBriefingForUser } from "@/lib/automation.server";

export const generateBriefing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const data = await buildBriefingData(context.supabase as any, context.userId);
    await context.supabase.from("daily_briefings").insert({ user_id: context.userId, date: new Date().toISOString().slice(0, 10), data });
    return data;
  });

export const getLatestBriefing = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("daily_briefings").select("*").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) return { briefing: data };
    const fresh = await buildBriefingData(context.supabase as any, context.userId);
    const hasData = fresh.newJobs.length || fresh.replies.length || fresh.followups.length || fresh.interviews.length || fresh.stats.applied;
    if (!hasData) return { briefing: null };
    const { data: row } = await context.supabase.from("daily_briefings").insert({ user_id: context.userId, date: new Date().toISOString().slice(0, 10), data: fresh }).select().single();
    return { briefing: row };
  });

export const sendBriefingEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => sendBriefingForUser(context.supabase as any, context.userId));
